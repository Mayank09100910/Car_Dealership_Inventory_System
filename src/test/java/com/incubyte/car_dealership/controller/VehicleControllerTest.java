package com.incubyte.car_dealership.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    public void testAdminCanPerformCrudAndRestock() throws Exception {
        // 1. Create a vehicle
        String vehiclePayload = """
                {
                    "make": "Toyota",
                    "model": "Camry",
                    "category": "Sedan",
                    "price": 25000.00,
                    "quantity": 10
                }
                """;

        String resultJson = mockMvc.perform(post("/api/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(vehiclePayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.make").value("Toyota"))
                .andExpect(jsonPath("$.quantity").value(10))
                .andReturn().getResponse().getContentAsString();

        // Extract ID (e.g. from json)
        Long vehicleId = Long.parseLong(resultJson.replaceAll(".*\"id\":([0-9]+).*", "$1"));

        // 2. Update the vehicle
        String updatePayload = """
                {
                    "make": "Toyota",
                    "model": "Camry Hybrid",
                    "category": "Sedan",
                    "price": 28000.00,
                    "quantity": 8
                }
                """;

        mockMvc.perform(put("/api/vehicles/" + vehicleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.model").value("Camry Hybrid"))
                .andExpect(jsonPath("$.price").value(28000.00));

        // 3. Get all vehicles
        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].model").value("Camry Hybrid"));

        // 4. Delete the vehicle
        mockMvc.perform(delete("/api/vehicles/" + vehicleId))
                .andExpect(status().isNoContent());

        // Verify deleted (returns 404 or empty list)
        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @WithMockUser(username = "regular_user", roles = {"USER"})
    public void testUserCannotPerformWriteOperations() throws Exception {
        // Create vehicle should fail for USER
        String vehiclePayload = """
                {
                    "make": "Ford",
                    "model": "Mustang",
                    "category": "Sports",
                    "price": 55000.00,
                    "quantity": 5
                }
                """;

        mockMvc.perform(post("/api/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(vehiclePayload))
                .andExpect(status().isForbidden());

        // Update should fail for USER
        mockMvc.perform(put("/api/vehicles/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(vehiclePayload))
                .andExpect(status().isForbidden());

        // Delete should fail for USER
        mockMvc.perform(delete("/api/vehicles/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "regular_user", roles = {"USER"})
    public void testSearchVehicles() throws Exception {
        mockMvc.perform(get("/api/vehicles/search")
                        .param("make", "Toyota")
                        .param("category", "Sedan"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    public void testPurchaseFlowSuccessfulAndThenOutOfStock() throws Exception {
        // 1. Create a vehicle with quantity = 1
        String vehiclePayload = """
                {
                    "make": "Honda",
                    "model": "Civic",
                    "category": "Sedan",
                    "price": 22000.00,
                    "quantity": 1
                }
                """;

        String resultJson = mockMvc.perform(post("/api/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(vehiclePayload))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long vehicleId = Long.parseLong(resultJson.replaceAll(".*\"id\":([0-9]+).*", "$1"));

        // 2. Purchase (decreases quantity to 0)
        mockMvc.perform(post("/api/vehicles/" + vehicleId + "/purchase"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(0));

        // 3. Purchase again (fails with 400 Bad Request, out of stock)
        mockMvc.perform(post("/api/vehicles/" + vehicleId + "/purchase"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Vehicle out of stock"));
    }

    @Test
    @WithMockUser(username = "regular_user", roles = {"USER"})
    public void testRestockForbiddenForUser() throws Exception {
        mockMvc.perform(post("/api/vehicles/1/restock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantity\": 10}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    public void testRestockAllowedForAdmin() throws Exception {
        // 1. Create a vehicle
        String vehiclePayload = """
                {
                    "make": "Tesla",
                    "model": "Model 3",
                    "category": "Electric",
                    "price": 45000.00,
                    "quantity": 2
                }
                """;

        String resultJson = mockMvc.perform(post("/api/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(vehiclePayload))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long vehicleId = Long.parseLong(resultJson.replaceAll(".*\"id\":([0-9]+).*", "$1"));

        // 2. Restock (increases quantity by 5 -> 7)
        mockMvc.perform(post("/api/vehicles/" + vehicleId + "/restock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantity\": 5}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(7));

        // 3. Restock with invalid/negative quantity (fails with 400 Bad Request)
        mockMvc.perform(post("/api/vehicles/" + vehicleId + "/restock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantity\": -1}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Restock quantity must be positive"));
    }
}
