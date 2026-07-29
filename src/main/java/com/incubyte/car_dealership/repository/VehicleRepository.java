package com.incubyte.car_dealership.repository;

import com.incubyte.car_dealership.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    @Query("SELECT v FROM Vehicle v WHERE " +
            "(CAST(:make AS string) IS NULL OR LOWER(v.make) LIKE LOWER(CONCAT('%', CAST(:make AS string), '%'))) AND " +
            "(CAST(:model AS string) IS NULL OR LOWER(v.model) LIKE LOWER(CONCAT('%', CAST(:model AS string), '%'))) AND " +
            "(CAST(:category AS string) IS NULL OR LOWER(v.category) LIKE LOWER(CONCAT('%', CAST(:category AS string), '%'))) AND " +
            "(:minPrice IS NULL OR v.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR v.price <= :maxPrice)")
    List<Vehicle> searchVehicles(
            @Param("make") String make,
            @Param("model") String model,
            @Param("category") String category,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice
    );
}
