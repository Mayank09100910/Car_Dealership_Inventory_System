package com.incubyte.car_dealership.service;

import com.incubyte.car_dealership.entity.Vehicle;
import com.incubyte.car_dealership.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    public Vehicle createVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));
    }

    public Vehicle updateVehicle(Long id, Vehicle vehicleDetails) {
        Vehicle vehicle = getVehicleById(id);
        vehicle.setMake(vehicleDetails.getMake());
        vehicle.setModel(vehicleDetails.getModel());
        vehicle.setCategory(vehicleDetails.getCategory());
        vehicle.setPrice(vehicleDetails.getPrice());
        vehicle.setQuantity(vehicleDetails.getQuantity());
        return vehicleRepository.save(vehicle);
    }

    public void deleteVehicle(Long id) {
        Vehicle vehicle = getVehicleById(id);
        vehicleRepository.delete(vehicle);
    }

    public List<Vehicle> searchVehicles(String make, String model, String category, BigDecimal minPrice, BigDecimal maxPrice) {
        return vehicleRepository.searchVehicles(make, model, category, minPrice, maxPrice);
    }

    @Transactional
    public synchronized Vehicle purchaseVehicle(Long id) {
        Vehicle vehicle = getVehicleById(id);
        if (vehicle.getQuantity() <= 0) {
            throw new RuntimeException("Vehicle out of stock");
        }
        vehicle.setQuantity(vehicle.getQuantity() - 1);
        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle restockVehicle(Long id, int amount) {
        if (amount <= 0) {
            throw new RuntimeException("Restock quantity must be positive");
        }
        Vehicle vehicle = getVehicleById(id);
        vehicle.setQuantity(vehicle.getQuantity() + amount);
        return vehicleRepository.save(vehicle);
    }
}
