const BASE_URL = 'http://localhost:8080/api';

export const orderService = {
  // Get orders for a user
  async getUserOrders(userId) {
    try {
      const response = await fetch(`${BASE_URL}/orders/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load order history.');
      }

      return await response.json();
    } catch (error) {
      console.error('Order history fetch failed:', error);
      throw error;
    }
  },

  // Fetch order detail
  async getOrderDetail(orderId) {
    try {
      const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load order details.');
      }

      return await response.json();
    } catch (error) {
      console.error('Order detail fetch failed:', error);
      throw error;
    }
  },

  // Fetch order by order number
  async getOrderByNumber(orderNumber) {
    try {
      const response = await fetch(`${BASE_URL}/orders/number/${orderNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to find order.');
      }

      return await response.json();
    } catch (error) {
      console.error('Order lookup by number failed:', error);
      throw error;
    }
  },

  // Cancel order
  async cancelOrder(orderId, reason) {
    try {
      const response = await fetch(`${BASE_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Order cancellation failed.');
      }

      return await response.json();
    } catch (error) {
      console.error('Order cancellation failed:', error);
      throw error;
    }
  },
};

// Order status labels
export const ORDER_STATUS_MAP = {
  PENDING: 'Processing',
  CONFIRMED: 'Order confirmed',
  PROCESSING: 'Preparing',
  SHIPPED: 'In transit',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded'
};

// Payment status labels
export const PAYMENT_STATUS_MAP = {
  PENDING: 'Payment pending',
  COMPLETED: 'Payment completed',
  FAILED: 'Payment failed',
  CANCELLED: 'Payment cancelled',
  REFUNDED: 'Refunded'
};

// Order item status labels
export const ITEM_STATUS_MAP = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
  REFUNDED: 'Refunded'
};
