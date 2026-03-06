const BASE_URL = 'http://localhost:8080/api';

export const orderService = {
  // 사용자별 주문 내역 조회
  async getUserOrders(userId) {
    try {
      const response = await fetch(`${BASE_URL}/orders/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('주문 내역 조회에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('주문 내역 조회 오류:', error);
      throw error;
    }
  },

  // 주문 상세 조회
  async getOrderDetail(orderId) {
    try {
      const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('주문 상세 조회에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('주문 상세 조회 오류:', error);
      throw error;
    }
  },

  // 주문 번호로 주문 조회
  async getOrderByNumber(orderNumber) {
    try {
      const response = await fetch(`${BASE_URL}/orders/number/${orderNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('주문 조회에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('주문 번호로 조회 오류:', error);
      throw error;
    }
  },

  // 주문 취소
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
        throw new Error('주문 취소에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('주문 취소 오류:', error);
      throw error;
    }
  },
};

// 주문 상태 한글 매핑
export const ORDER_STATUS_MAP = {
  PENDING: '주문 대기',
  CONFIRMED: '주문 확인',
  PROCESSING: '상품 준비 중',
  SHIPPED: '배송 중',
  DELIVERED: '배송 완료',
  CANCELLED: '주문 취소',
  REFUNDED: '환불 완료'
};

// 결제 상태 한글 매핑
export const PAYMENT_STATUS_MAP = {
  PENDING: '결제 대기',
  COMPLETED: '결제 완료',
  FAILED: '결제 실패',
  CANCELLED: '결제 취소',
  REFUNDED: '환불 완료'
};

// 주문 아이템 상태 한글 매핑
export const ITEM_STATUS_MAP = {
  PENDING: '처리 대기',
  CONFIRMED: '확인됨',
  PROCESSING: '준비 중',
  SHIPPED: '배송됨',
  DELIVERED: '배송 완료',
  CANCELLED: '취소됨',
  RETURNED: '반품됨',
  REFUNDED: '환불됨'
};