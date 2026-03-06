import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { findUserByEmail, findUserById } from '../../db/userTable'
import { orderService, ORDER_STATUS_MAP } from '../../services/orderService'
import useStore from '../../store/useStore'

const MyPage = () => {
  const navigate = useNavigate()
  const logout = useStore((state) => state.logout)
  const authUser = useStore((state) => state.authUser)

  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState({
    id: authUser?.id ?? '',
    name: authUser?.name ?? '',
    email: authUser?.email ?? 'october@example.com',
    phoneNumber: authUser?.phoneNumber ?? '',
    address: {
      postalCode: '',
      address: authUser?.address ?? '',
      detailAddress: ''
    }
  })

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState('')

  const initials = useMemo(() => {
    return user.name ? user.name.charAt(0) : 'O'
  }, [user.name])

  useEffect(() => {
    if (!authUser) {
      return
    }

    const dbUser =
      (authUser.id ? findUserById(authUser.id) : null) ??
      (authUser.email ? findUserByEmail(authUser.email) : null)

    if (dbUser) {
      setUser((prev) => ({
        ...prev,
        id: dbUser.id,
        name: dbUser.name ?? '',
        email: dbUser.email ?? '',
        phoneNumber: dbUser.phoneNumber ?? '',
        address: {
          ...prev.address,
          address: dbUser.address ?? '',
        },
      }))
      return
    }

    setUser((prev) => ({
      ...prev,
      id: authUser.id ?? prev.id,
      name: authUser.name ?? prev.name,
      email: authUser.email ?? prev.email,
      phoneNumber: authUser.phoneNumber ?? prev.phoneNumber,
      address: {
        ...prev.address,
        address: authUser.address ?? prev.address.address,
      },
    }))
  }, [authUser])

  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true)
      setOrdersError('')
      try {
        const orderData = await orderService.getUserOrders(user.id)
        setOrders(orderData || [])
      } catch (error) {
        setOrdersError('주문 내역을 불러오는데 실패했습니다.')
        setOrders([])
      } finally {
        setOrdersLoading(false)
      }
    }

    if (user.id) {
      fetchOrders()
    }
  }, [user.id])

  const handleProfileUpdate = (e) => {
    e.preventDefault()
    console.log('프로필 업데이트:', user)
    alert('프로필이 업데이트되었습니다.')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const renderProfileTab = () => (
    <div className="mypage-tab-content">
      <h2 className="mypage-tab-title">프로필 정보</h2>

      <form onSubmit={handleProfileUpdate} className="mypage-form-grid">
        <div className="field-wrap">
          <label>이름</label>
          <input
            type="text"
            value={user.name}
            onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
            className="glass-input"
          />
        </div>

        <div className="field-wrap">
          <label>이메일</label>
          <input type="email" value={user.email} readOnly className="glass-input mypage-readonly" />
          <p className="mypage-field-note">이메일은 변경할 수 없습니다.</p>
        </div>

        <div className="field-wrap">
          <label>휴대폰 번호</label>
          <div className="mypage-inline-row">
            <input type="tel" value={user.phoneNumber} readOnly className="glass-input mypage-readonly" />
            <button type="button" className="neo-btn mypage-inline-btn">번호 변경</button>
          </div>
        </div>

        <div className="mypage-block">
          <h3>배송 주소</h3>

          <div className="field-wrap">
            <label>우편번호</label>
            <div className="mypage-inline-row">
              <input type="text" value={user.address.postalCode} readOnly className="glass-input mypage-readonly" />
              <button type="button" className="neo-btn mypage-inline-btn">주소 변경</button>
            </div>
          </div>

          <div className="field-wrap">
            <label>주소</label>
            <input type="text" value={user.address.address} readOnly className="glass-input mypage-readonly" />
          </div>

          <div className="field-wrap">
            <label>상세 주소</label>
            <input
              type="text"
              value={user.address.detailAddress}
              onChange={(e) => setUser(prev => ({
                ...prev,
                address: { ...prev.address, detailAddress: e.target.value }
              }))}
              className="glass-input"
            />
          </div>
        </div>

        <button type="submit" className="neo-btn neo-btn-primary">프로필 저장</button>
      </form>
    </div>
  )

  const renderOrdersTab = () => (
    <div className="mypage-tab-content">
      <h2 className="mypage-tab-title">주문 내역</h2>

      {ordersLoading ? (
        <div className="mypage-empty">
          <p>주문 내역을 불러오는 중입니다.</p>
        </div>
      ) : ordersError ? (
        <div className="mypage-empty">
          <p style={{color: '#ff6b6b'}}>{ordersError}</p>
          <button onClick={() => window.location.reload()} className="neo-btn neo-btn-primary mypage-link-btn">다시 시도</button>
        </div>
      ) : orders.length === 0 ? (
        <div className="mypage-empty">
          <p>주문 내역이 없습니다.</p>
          <Link to="/products" className="neo-btn neo-btn-primary mypage-link-btn">상품 보러가기</Link>
        </div>
      ) : (
        <div className="mypage-orders">
          {orders.map((order) => (
            <div key={order.id} className="mypage-order-card">
              <div className="mypage-order-head">
                <div>
                  <p className="mypage-order-id">주문번호: {order.orderNumber || order.id}</p>
                  <p className="mypage-order-date">주문일자: {order.orderedAt ? new Date(order.orderedAt).toLocaleDateString() : new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`mypage-order-status ${order.status === 'DELIVERED' ? 'done' : 'shipping'}`}>
                  {ORDER_STATUS_MAP[order.status] || order.status}
                </span>
              </div>

              {order.orderItems && order.orderItems.length > 0 ? (
                <div className="mypage-order-items">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="mypage-order-item-row">
                      <span>{item.productName || item.product?.name || '상품명 없음'} ({item.size})</span>
                      <span>{(item.unitPrice || 0).toLocaleString()}원 × {item.quantity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mypage-order-items">
                  <p>주문 상품 정보를 불러올 수 없습니다.</p>
                </div>
              )}

              <div className="mypage-order-total">
                <span>총 결제금액</span>
                <strong>{(order.totalAmount || 0).toLocaleString()}원</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="db-schema-note">
        사용 테이블: orders, order_items, inventory, inventory_history, products
      </p>
    </div>
  )

  const renderSettingsTab = () => (
    <div className="mypage-tab-content">
      <h2 className="mypage-tab-title">계정 설정</h2>

      <div className="mypage-settings-grid">
        <div className="mypage-setting-card">
          <h3>비밀번호 변경</h3>
          <form className="mypage-form-grid">
            <div className="field-wrap">
              <label>현재 비밀번호</label>
              <input type="password" className="glass-input" placeholder="현재 비밀번호" />
            </div>
            <div className="field-wrap">
              <label>새 비밀번호</label>
              <input type="password" className="glass-input" placeholder="새 비밀번호" />
            </div>
            <div className="field-wrap">
              <label>새 비밀번호 확인</label>
              <input type="password" className="glass-input" placeholder="새 비밀번호 확인" />
            </div>
            <button type="submit" className="neo-btn">비밀번호 변경</button>
          </form>
        </div>

        <div className="mypage-setting-card">
          <h3>알림 설정</h3>
          <div className="mypage-checks">
            <label><input type="checkbox" defaultChecked />주문 상태 알림</label>
            <label><input type="checkbox" defaultChecked />신상품 알림</label>
            <label><input type="checkbox" />이벤트 및 할인 알림</label>
          </div>
        </div>

        <div className="mypage-setting-card danger">
          <h3>계정 관리</h3>
          <div className="mypage-danger-actions">
            <button onClick={handleLogout} className="neo-btn" type="button">로그아웃</button>
            <button className="neo-btn" type="button">계정 탈퇴</button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="mypage-page">
      <div className="mypage-wrap">
        <div className="mypage-header">
          <h1>마이페이지</h1>
          <p>계정 정보를 관리하고 주문 내역을 확인하세요</p>
        </div>

        <div className="mypage-layout">
          <aside className="mypage-sidebar-card">
            <div className="mypage-avatar-wrap">
              <div className="mypage-avatar">{initials}</div>
              <h3>{user.name}</h3>
            </div>

            <nav className="mypage-tab-nav">
              <button onClick={() => setActiveTab('profile')} className={`mypage-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}>
                프로필 정보
              </button>
              <button onClick={() => setActiveTab('orders')} className={`mypage-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}>
                주문 내역
              </button>
              <button onClick={() => setActiveTab('settings')} className={`mypage-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}>
                계정 설정
              </button>
            </nav>
          </aside>

          <section className="mypage-main-card">
            <div key={activeTab} className="mypage-tab-panel">
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'orders' && renderOrdersTab()}
              {activeTab === 'settings' && renderSettingsTab()}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default MyPage
