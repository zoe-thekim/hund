package com.hund.shop.repository;

import com.hund.shop.model.Order;
import com.hund.shop.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserOrderByCreatedAtDesc(User user);

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByStatus(Order.OrderStatus status);
}