package com.hund.shop.repository;

import com.hund.shop.model.CartItem;
import com.hund.shop.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);

    Optional<CartItem> findByIdAndUser(Long id, User user);

    void deleteByUser(User user);
}
