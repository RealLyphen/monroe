'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiLayout, FiMapPin, FiPackage, FiSend, FiStar, 
  FiSearch, FiBell, FiCopy, FiCheckCircle, FiMessageCircle, FiUsers,
  FiCamera, FiUpload, FiX, FiImage, FiTruck, FiLogOut,
  FiDollarSign, FiLayers, FiBox, FiBriefcase
} from 'react-icons/fi';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Real data states
  const [packages, setPackages] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [allWallets, setAllWallets] = useState({});
  const [searchAddr, setSearchAddr] = useState('');
  const [searchParcels, setSearchParcels] = useState('');
  const [formState, setFormState] = useState({ addressIndex: 0, trackingId: '', note: '', weight: '', dimensions: '' });
  const [forwardAddress, setForwardAddress] = useState({ name: '', street: '', city: '', state: '', zip: '', country: '' });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);

  // Admin form states
  const [notifForm, setNotifForm] = useState({ target: 'ALL', title: '', message: '' });
  const [reviewForm, setReviewForm] = useState({ content: '', rating: 5 });
  const [walletForm, setWalletForm] = useState({ username: '', amount: '', type: 'credit', note: '' });
  const [addressModal, setAddressModal] = useState({ isOpen: false, mode: 'ADD', id: null });
  const [addressForm, setAddressForm] = useState({ name: '', street: '', city: '', state: '', zip: '', country: '' });

  // Admin Wallet States
  const [adminBalances, setAdminBalances] = useState(null);
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', currency: 'USDT', network: 'TRC20', address: '' });

  // Modal states
  const [receiveModal, setReceiveModal] = useState(null);
  const [forwardModal, setForwardModal] = useState(null);
  const [userForwardModal, setUserForwardModal] = useState(null);
  const [saveAddressChecked, setSaveAddressChecked] = useState(false);
  const [forwardConfirmStep, setForwardConfirmStep] = useState(false);
  const [topupModal, setTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [chatModal, setChatModal] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [forwardTrackingInput, setForwardTrackingInput] = useState('');
  const [deductionAmount, setDeductionAmount] = useState('');
  const [receiveWeight, setReceiveWeight] = useState('');
  const [receiveDimensions, setReceiveDimensions] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Chat states
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Consolidation states
  const [consolidateMode, setConsolidateMode] = useState(false);
  const [selectedForConsolidate, setSelectedForConsolidate] = useState([]);
  const [adminPackageFilter, setAdminPackageFilter] = useState('all');

  const fetchData = async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) throw new Error('Not auth');
      const authData = await authRes.json();
      setUser(authData.user);

      const dataRes = await fetch('/api/dashboard/data');
      if (dataRes.ok) {
        const payload = await dataRes.json();
        setPackages(payload.packages || []);
        setAddresses(payload.addresses || []);
        setNotifications(payload.notifications || []);
        if (payload.users) setAllUsers(payload.users);
        if (payload.wallet) setWallet(payload.wallet);
        if (payload.savedAddresses) setSavedAddresses(payload.savedAddresses);
        if (payload.wallets) setAllWallets(payload.wallets);
      }
      setLoading(false);
    } catch (e) {
      router.push('/');
    }
  };

  const fetchAdminBalance = async () => {
    try {
      const res = await fetch('/api/admin/wallet/balance');
      if (res.ok) {
        const data = await res.json();
        setAdminBalances(data.balances || {});
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchData(); }, [router]);

  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'admin_wallet') {
      fetchAdminBalance();
    }
  }, [activeTab, user]);

  // ── Ctrl+V paste image support ──
  const handlePaste = useCallback((e) => {
    if (!receiveModal) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) return;
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);
        break;
      }
    }
  }, [receiveModal]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  // ── Live Chat Polling ──
  useEffect(() => {
    let interval;
    if (chatModal) {
      // Poll every 3 seconds while chat is open
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/chat?packageId=${chatModal.id}`);
          if (res.ok) {
            const data = await res.json();
            setChatMessages(prev => {
              // Only update state if there are new messages
              if (data.messages && data.messages.length > prev.length) {
                setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                return data.messages;
              }
              return prev;
            });
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [chatModal]);

  if (loading || !user) {
    return <div className={styles.dashboardContainer} style={{alignItems: 'center', justifyContent: 'center'}}>Loading...</div>;
  }

  const stats = {
    total: packages.length,
    pending: packages.filter(p => p.status === 'Pending').length,
    received: packages.filter(p => p.status === 'Received').length,
    forwarded: packages.filter(p => p.status === 'Forwarded').length,
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  // ── Admin: Address Management ──
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    
    const action = addressModal.mode === 'ADD' ? 'ADD' : 'EDIT';
    const payload = { action, address: { ...addressForm, id: addressModal.id } };

    const res = await fetch('/api/admin/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      await fetchData();
      setAddressModal({ isOpen: false, mode: 'ADD', id: null });
      setAddressForm({ name: '', street: '', city: '', state: '', zip: '', country: '' });
    }
    setModalLoading(false);
  };

  const openEditAddressModal = (addr) => {
    setAddressForm({ name: addr.name, street: addr.street, city: addr.city, state: addr.state || '', zip: addr.zip || '', country: addr.country || '' });
    setAddressModal({ isOpen: true, mode: 'EDIT', id: addr.id });
  };

  // ── Package Submit ──
  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    if (!formState.trackingId) return;

    const res = await fetch('/api/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        addressId: addresses[formState.addressIndex].id,
        addressCity: addresses[formState.addressIndex].city,
        trackingId: formState.trackingId,
        note: formState.note,
        forwardAddress,
        weight: formState.weight,
        dimensions: formState.dimensions,
      })
    });

    if (res.ok) {
      await fetchData();
      setSubmitSuccess(true);
      setFormState({ addressIndex: 0, trackingId: '', note: '', weight: '', dimensions: '' });
      setForwardAddress({ name: '', street: '', city: '', state: '', zip: '', country: '' });
      setTimeout(() => { setSubmitSuccess(false); setActiveTab('packages'); }, 2000);
    }
  };

  // ── Admin: Receive with Photo ──
  const handleOpenReceiveModal = (pkg) => {
    setReceiveModal(pkg);
    setPhotoFile(null);
    setPhotoPreview(null);
    setReceiveWeight(pkg.weight || '');
    setReceiveDimensions(pkg.dimensions || '');
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleConfirmReceive = async () => {
    if (!receiveModal) return;
    setModalLoading(true);

    let photoUrl = '';
    if (photoFile) {
      const formData = new FormData();
      formData.append('photo', photoFile);
      const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        photoUrl = uploadData.url;
      }
    }

    await fetch('/api/admin/packages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: receiveModal.id, 
        status: 'Received', 
        photoUrl: photoUrl || undefined,
        weight: receiveWeight || undefined,
        dimensions: receiveDimensions || undefined,
      })
    });

    setModalLoading(false);
    setReceiveModal(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    fetchData();
  };

  // ── Admin: Forward with Tracking ──
  const handleOpenForwardModal = (pkg) => {
    setForwardModal(pkg);
    setForwardTrackingInput('');
    setDeductionAmount('');
  };

  const handleConfirmForward = async () => {
    if (!forwardModal || !forwardTrackingInput.trim()) return;
    setModalLoading(true);

    await fetch('/api/admin/packages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: forwardModal.id, 
        status: 'Forwarded', 
        forwardTrackingId: forwardTrackingInput.trim(),
        deductionAmount: deductionAmount || 0
      })
    });

    setModalLoading(false);
    setForwardModal(null);
    setForwardTrackingInput('');
    setDeductionAmount('');
    fetchData();
  };

  // ── Admin: Complete Order ──
  const handleCompleteOrder = async (pkgId) => {
    if (!confirm("Mark this order as complete?")) return;
    await fetch('/api/admin/packages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: pkgId, status: 'Completed' })
    });
    fetchData();
  };

  // ── User: Setup Forward Address ──
  const handleUserForwardSubmit = async (e) => {
    e.preventDefault();
    if (!userForwardModal) return;

    if (!forwardConfirmStep) {
      // Step 1: User hits "Save Address" on the first modal page. Move to confirm step.
      setForwardConfirmStep(true);
      return;
    }

    // Step 2: User hits "Confirm Shipment" on the second modal page
    setModalLoading(true);

    try {
      // Opt-in: Save address for future use
      if (saveAddressChecked) {
        await fetch('/api/user/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'ADD', address: forwardAddress })
        });
      }

      // Submit forward package request
      const res = await fetch('/api/packages/forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: userForwardModal.id,
          forwardAddress
        })
      });
      
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to Forward Package');
      }
      
      setUserForwardModal(null);
      setForwardConfirmStep(false);
      setSaveAddressChecked(false);
      setForwardAddress({ name: '', street: '', city: '', state: '', zip: '', country: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // ── Wallet Top-Up ──
  const handleTopupSubmit = async (e) => {
    e.preventDefault();
    if (!topupAmount || isNaN(topupAmount) || Number(topupAmount) < 1) {
      alert("Please enter a valid amount (minimum $1).");
      return;
    }
    
    setModalLoading(true);
    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: topupAmount })
      });
      
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url; // Redirect to Cryptomus invoice
      } else {
        alert(data.error || "Failed to generate payment url.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  // ── Chat ──
  const handleOpenChat = async (pkg) => {
    setChatModal(pkg);
    setChatMessages([]);
    setChatLoading(true);
    try {
      const res = await fetch(`/api/chat?packageId=${pkg.id}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data.messages || []);
      }
    } catch (e) { console.error(e); }
    setChatLoading(false);
  };

  const handleSendChat = async () => {
    if (!chatModal || !chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: chatModal.id, message: msg })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, data.message]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (e) { console.error(e); }
  };

  // ── Consolidation ──
  const handleConsolidate = async () => {
    if (selectedForConsolidate.length < 2) return;
    setModalLoading(true);

    await fetch('/api/admin/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'CONSOLIDATE', packageIds: selectedForConsolidate })
    });

    setModalLoading(false);
    setConsolidateMode(false);
    setSelectedForConsolidate([]);
    fetchData();
  };

  const toggleConsolidateSelect = (pkgId) => {
    setSelectedForConsolidate(prev => 
      prev.includes(pkgId) ? prev.filter(id => id !== pkgId) : [...prev, pkgId]
    );
  };

  // ── Wallet (admin) ──
  const handleAdminWithdraw = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const res = await fetch('/api/admin/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withdrawForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Withdrawal failed');
      alert('Withdrawal initiated! TX ID: ' + data.txId);
      setWithdrawForm({ amount: '', currency: 'USDT', network: 'TRC20', address: '' });
      fetchAdminBalance();
    } catch (err) {
      alert(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleWalletUpdate = async (e) => {
    e.preventDefault();
    await fetch('/api/admin/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(walletForm)
    });
    setWalletForm({ username: '', amount: '', type: 'credit', note: '' });
    fetchData();
    alert('Wallet updated successfully');
  };

  const handleAdminSendNotif = async (e) => {
    e.preventDefault();
    await fetch('/api/admin/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notifForm)
    });
    setNotifForm({ target: 'ALL', title: '', message: '' });
    fetchData();
    alert("Notification sent successfully");
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (packages.length === 0 && user.role !== 'admin') {
      alert("You must have at least one package submitted to post a vouch.");
      return;
    }
    await fetch('/api/reviews', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(reviewForm)
    });
    setReviewForm({ content: '', rating: 5 });
    alert("Review posted successfully!");
  };

  const isAdmin = user.role === 'admin';

  // Filtered packages
  const filteredPackages = packages.filter(p => {
    if (isAdmin && activeTab === 'packages') {
      if (adminPackageFilter === 'pending' && p.status !== 'Pending') return false;
      if (adminPackageFilter === 'forwarding' && (p.status !== 'Received' || !p.forwardAddress?.city || p.forwardTrackingId)) return false;
      if (adminPackageFilter === 'completed' && p.status !== 'Completed') return false;
    }
    if (!searchParcels) return true;
    const q = searchParcels.toLowerCase();
    return (
      (p.id || '').toLowerCase().includes(q) ||
      (p.trackingId || '').toLowerCase().includes(q) ||
      (p.username || '').toLowerCase().includes(q) ||
      (p.addressCity || '').toLowerCase().includes(q) ||
      (p.forwardTrackingId || '').toLowerCase().includes(q) ||
      (p.status || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.dashboardContainer}>
      
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}>
          <img src="/logo.png" alt="Monroe Logo" style={{ width: '160px', height: '35px', objectFit: 'contain' }} />
        </Link>
        
        <nav className={styles.navMenu}>
          <button className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`} onClick={() => setActiveTab('dashboard')}>
            <FiLayout /> Dashboard
          </button>
          
          {isAdmin ? (
            <>
              <button className={`${styles.navItem} ${activeTab === 'packages' ? styles.active : ''}`} onClick={() => setActiveTab('packages')}>
                <FiPackage /> Manage Parcels
              </button>
              <button className={`${styles.navItem} ${activeTab === 'addresses' ? styles.active : ''}`} onClick={() => setActiveTab('addresses')}>
                <FiMapPin /> Manage Addresses
              </button>
              <button className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`} onClick={() => setActiveTab('users')}>
                <FiUsers /> Manage Users
              </button>
              <button className={`${styles.navItem} ${activeTab === 'wallets' ? styles.active : ''}`} onClick={() => setActiveTab('wallets')}>
                <FiDollarSign /> Manage Wallets
              </button>
              <button className={`${styles.navItem} ${activeTab === 'admin_wallet' ? styles.active : ''}`} onClick={() => setActiveTab('admin_wallet')}>
                <FiBriefcase /> Owner Wallet
              </button>
              <button className={`${styles.navItem} ${activeTab === 'notify' ? styles.active : ''}`} onClick={() => setActiveTab('notify')}>
                <FiBell /> Broadcast Alerts
              </button>
              <button className={`${styles.navItem} ${activeTab === 'review' ? styles.active : ''}`} onClick={() => setActiveTab('review')}>
                <FiStar /> Admin Review
              </button>
            </>
          ) : (
            <>
              <button className={`${styles.navItem} ${activeTab === 'addresses' ? styles.active : ''}`} onClick={() => setActiveTab('addresses')}>
                <FiMapPin /> Reship Addresses
              </button>
              <button className={`${styles.navItem} ${activeTab === 'packages' ? styles.active : ''}`} onClick={() => setActiveTab('packages')}>
                <FiPackage /> My Packages
              </button>
              <button className={`${styles.navItem} ${activeTab === 'submit' ? styles.active : ''}`} onClick={() => setActiveTab('submit')}>
                <FiSend /> Submit Package
              </button>
              <button className={`${styles.navItem} ${activeTab === 'review' ? styles.active : ''}`} onClick={() => setActiveTab('review')}>
                <FiStar /> Post Review
              </button>
            </>
          )}
        </nav>

        {/* Sidebar Bottom: Wallet + Logout */}
        <div className={styles.sidebarBottom}>
          {!isAdmin && (
            <div className={styles.walletCard}>
              <p className={styles.walletLabel}>💰 Wallet Balance</p>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <p className={styles.walletBalance} style={{margin: 0}}>${wallet.balance?.toFixed(2) || '0.00'}</p>
                <button 
                  className={styles.submitBtn} 
                  style={{padding: '4px 12px', fontSize: '12px', borderRadius: '8px', minWidth: 'auto'}}
                  onClick={() => setTopupModal(true)}
                >
                  Top Up
                </button>
              </div>
            </div>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FiLogOut /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        
        {/* Top Header */}
        <header className={styles.topHeader}>
          <h1 className={styles.welcomeText}>Welcome Back, {isAdmin ? 'Admin' : user.username}</h1>
          <div className={styles.headerActions}>
            <div style={{position: 'relative'}}>
              <div className={styles.iconBtn} onClick={() => setShowNotifs(!showNotifs)}>
                <FiBell />
                {notifications.length > 0 && <div style={{position: 'absolute', top: 0, right: 0, background: '#ff3b30', width: '8px', height: '8px', borderRadius: '50%'}}></div>}
              </div>
              
              {showNotifs && (
                <div className={styles.notifDropdown}>
                  <h3 className={styles.notifTitle}>Notifications</h3>
                  {notifications.length === 0 ? <p style={{fontSize: '13px', color: 'rgba(255,255,255,0.4)'}}>No new alerts.</p> : (
                    <div style={{maxHeight:'300px', overflowY:'auto'}}>
                      {notifications.map(n => (
                        <div key={n.id} className={styles.notifItem}>
                          <div className={styles.notifItemTitle}>{n.title}</div>
                          <div className={styles.notifItemMsg}>{n.message}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className={styles.profileBadge}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className={styles.avatar} style={{ objectFit: 'cover' }} />
              ) : (
                <div className={styles.avatar}>{user.username.charAt(0)}</div>
              )}
              <span>{user.username}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Content */}
        <div className={styles.tabContent}>
          
          {/* TAB: Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <>
              <div className={styles.glassCard} style={{ background: 'linear-gradient(135deg, rgba(245, 197, 24, 0.1) 0%, rgba(0,0,0,0) 100%)' }}>
                <h2 style={{marginTop: 0, marginBottom: '8px', color: '#f5c518'}}>Built on Trust and Standards</h2>
                <p style={{color: 'rgba(255,255,255,0.6)', maxWidth: '600px', lineHeight: 1.6}}>
                  Our reshipping rules ensure all orders are handled responsibly. We process, track, and forward your items with priority efficiency.
                </p>
                <button className={styles.submitBtn} style={{marginTop: '20px', padding: '10px 24px'}} onClick={() => setActiveTab('addresses')}>
                  View Addresses
                </button>
              </div>

              <h2 style={{fontSize: '18px', marginBottom: '16px', color: '#fff'}}>Account Overview</h2>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <h3>{isAdmin ? 'Total Packages' : 'Your Packages'}</h3>
                  <p className={styles.value}>{stats.total}</p>
                </div>
                <div className={`${styles.statCard} ${styles.highlight}`}>
                  <h3>Pending</h3>
                  <p className={styles.value}>{stats.pending}</p>
                </div>
                <div className={styles.statCard}>
                  <h3>Received</h3>
                  <p className={styles.value} style={{color: '#32cd32'}}>{stats.received}</p>
                </div>
                <div className={styles.statCard}>
                  <h3>Forwarded</h3>
                  <p className={styles.value} style={{color: '#6495ed'}}>{stats.forwarded}</p>
                </div>
              </div>

              {/* Platform Analytics */}
              {isAdmin && (
                <div className={styles.glassCard} style={{marginTop: '24px'}}>
                  <h2 className={styles.gradientText} style={{margin: '0 0 16px', fontSize: '20px'}}>Platform Analytics</h2>
                  <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
                    <div style={{flex: 1, minWidth: '200px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px'}}>
                      <h4 style={{margin: '0 0 8px', color: 'rgba(255,255,255,0.6)'}}>Reshipping Success Rate</h4>
                      <div style={{width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden'}}>
                        <div style={{width: `${Math.max(1, (packages.filter(p => p.status === 'Completed').length / (stats.total || 1)) * 100)}%`, height: '100%', background: '#32cd32'}}></div>
                      </div>
                      <p style={{marginTop: '8px', fontSize: '14px', color: '#32cd32'}}>{((packages.filter(p => p.status === 'Completed').length / (stats.total || 1)) * 100).toFixed(1)}% Completed</p>
                    </div>
                    <div style={{flex: 1, minWidth: '200px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px'}}>
                      <h4 style={{margin: '0 0 8px', color: 'rgba(255,255,255,0.6)'}}>Active Forward Requests</h4>
                      <p style={{fontSize: '24px', margin: 0, fontWeight: 600, color: '#f5c518'}}>
                        {packages.filter(p => p.status === 'Received' && p.forwardAddress && !p.forwardTrackingId).length}
                      </p>
                      <p style={{margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)'}}>Awaiting tracking updates</p>
                    </div>
                  </div>
                </div>
              )}

              {/* User wallet transactions on dashboard */}
              {!isAdmin && wallet.transactions?.length > 0 && (
                <div className={styles.glassCard}>
                  <h2 className={styles.gradientText} style={{margin: '0 0 16px'}}>Recent Transactions</h2>
                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Note</th></tr></thead>
                      <tbody>
                        {wallet.transactions.slice(0, 5).map(t => (
                          <tr key={t.id}>
                            <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                            <td><span className={`${styles.statusBadge} ${t.type === 'credit' ? styles.statusReceived : styles.statusPending}`}>{t.type}</span></td>
                            <td style={{fontWeight: 600, color: t.type === 'credit' ? '#32cd32' : '#ff3b30'}}>{t.type === 'credit' ? '+' : '-'}${t.amount.toFixed(2)}</td>
                            <td style={{color: 'rgba(255,255,255,0.5)'}}>{t.note || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB: Reship Addresses */}
          {activeTab === 'addresses' && (
            <>
              <div className={styles.glassCard} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 className={styles.gradientText} style={{margin: '0 0 8px 0'}}>Available Reship Addresses</h2>
                  <p style={{margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '14px'}}>
                    {isAdmin ? 'Manage platform reship addresses here.' : 'Ship your packages to any of these addresses. Use exactly as written.'}
                  </p>
                </div>
                <div style={{display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap'}}>
                  <div style={{position: 'relative', width: '250px'}}>
                    <FiSearch style={{position: 'absolute', left: '16px', top: '16px', color: 'rgba(255,255,255,0.4)'}}/>
                    <input type="text" placeholder="Search city or name..." className={styles.input} style={{paddingLeft: '44px'}} value={searchAddr} onChange={(e) => setSearchAddr(e.target.value)} />
                  </div>
                  {isAdmin && (
                    <button 
                      className={styles.submitBtn} 
                      style={{padding: '10px 20px', fontSize: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px'}}
                      onClick={() => setAddressModal({ isOpen: true, mode: 'ADD', id: null })}
                    >
                      <FiMapPin /> Add New Address
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.addressGrid}>
                {addresses.filter(a => (a.name+a.city+a.street).toLowerCase().includes(searchAddr.toLowerCase())).map((addr, idx) => {
                  const fullText = `${addr.name}\n${addr.street}\n${addr.city}`;
                  return (
                    <div key={idx} className={styles.addressCard}>
                      <h3 className={styles.addressName}>
                        {addr.name.replace(' (USE THIS NAME)', '')}
                        <span style={{fontSize: '11px', background: 'rgba(245,197,24,0.1)', padding:'2px 6px', borderRadius:'10px', fontWeight: 500}}>REQUIRED</span>
                      </h3>
                      <p className={styles.addressDetails}>{addr.street}<br/>{addr.city}</p>
                      {!isAdmin && (
                        <button className={styles.copyBtn} onClick={() => handleCopy(fullText, idx)}>
                          {copiedIndex === idx ? <FiCheckCircle color="#32cd32" /> : <FiCopy />}
                          {copiedIndex === idx ? 'Copied' : 'Copy Full Address'}
                        </button>
                      )}
                      {isAdmin && (
                        <div style={{display: 'flex', gap: '8px', marginTop: '16px'}}>
                          <button className={styles.copyBtn} style={{flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white'}} onClick={() => openEditAddressModal(addr)}>
                            Edit
                          </button>
                          <button className={styles.copyBtn} style={{flex: 1, background: 'rgba(255, 60, 48, 0.1)', color: '#ff3b30', borderColor: 'rgba(255, 60, 48, 0.1)'}} onClick={async () => {
                            if (!confirm('Are you sure you want to delete this address?')) return;
                            await fetch('/api/admin/addresses', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ action: 'DELETE', address: addr })});
                            fetchData();
                          }}>Delete</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Address Add/Edit Modal */}
              {addressModal.isOpen && (
                <div className={styles.modalOverlay} onClick={() => !modalLoading && setAddressModal({ isOpen: false, mode: 'ADD', id: null })}>
                  <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                    <button className={styles.closeBtn} onClick={() => setAddressModal({ isOpen: false, mode: 'ADD', id: null })} disabled={modalLoading}><FiX /></button>
                    <h2>{addressModal.mode === 'ADD' ? 'Add New Address' : 'Edit Address'}</h2>
                    
                    <form onSubmit={handleAddressSubmit}>
                      <div className={styles.formGroup}>
                        <label>Receiver Name</label>
                        <input type="text" className={styles.input} placeholder="e.g. John Doe (USE THIS NAME)" required 
                               value={addressForm.name} onChange={e => setAddressForm({...addressForm, name: e.target.value})} />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Street Address</label>
                        <input type="text" className={styles.input} placeholder="e.g. 123 Main St Ste 400" required 
                               value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} />
                      </div>
                      <div className={styles.formGroup} style={{flex: 1, marginBottom: 0}}>
                        <label>City</label>
                        <input type="text" className={styles.input} placeholder="e.g. London" 
                               value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} required />
                      </div>
                      <div className={styles.formGroup} style={{flex: 1, marginBottom: 0}}>
                        <label>State / Province</label>
                        <input type="text" className={styles.input} placeholder="e.g. NY" 
                               value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} required />
                      </div>
                      <div className={styles.formGroup} style={{flex: 1, marginBottom: 0}}>
                        <label>ZIP / Postal Code</label>
                        <input type="text" className={styles.input} placeholder="e.g. 10001" 
                               value={addressForm.zip} onChange={e => setAddressForm({...addressForm, zip: e.target.value})} required />
                      </div>
                      <div className={styles.formGroup} style={{flex: 1, marginBottom: 0}}>
                        <label>Country</label>
                        <input type="text" className={styles.input} placeholder="e.g. USA" 
                               value={addressForm.country} onChange={e => setAddressForm({...addressForm, country: e.target.value})} required />
                      </div>

                      <button type="submit" className={styles.submitBtn} disabled={modalLoading} style={{width: '100%', marginTop: '16px'}}>
                        {modalLoading ? 'Saving...' : 'Save Address'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB: Submit Package */}
          {activeTab === 'submit' && !isAdmin && (
            <div className={styles.glassCard} style={{maxWidth: '600px'}}>
              <h2 className={styles.gradientText} style={{margin: '0 0 24px'}}>Submit a Package</h2>
              {submitSuccess ? (
                <div style={{background: 'rgba(50, 205, 50, 0.1)', border: '1px solid rgba(50, 205, 50, 0.2)', padding: '24px', borderRadius: '16px', textAlign: 'center'}}>
                  <FiCheckCircle size={48} color="#32cd32" style={{marginBottom: '16px'}} />
                  <h3 style={{margin: '0 0 8px', color: '#fff'}}>Package Submitted Successfully!</h3>
                  <p style={{color: 'rgba(255,255,255,0.7)', fontSize: '14px'}}>Redirecting to My Packages...</p>
                </div>
              ) : (
                <form onSubmit={handlePackageSubmit}>
                  <div className={styles.formGroup}>
                    <label>Select Reship Address</label>
                    <select className={styles.select} value={formState.addressIndex} onChange={e => setFormState({...formState, addressIndex: Number(e.target.value)})} required>
                      {addresses.map((a, i) => (<option key={i} value={i}>{a.city} — {a.street}</option>))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Tracking ID</label>
                    <input type="text" className={styles.input} placeholder="e.g. 1Z9999999999999999" value={formState.trackingId} onChange={e => setFormState({...formState, trackingId: e.target.value})} required />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Notes (Optional)</label>
                    <textarea className={styles.textarea} placeholder="Special instructions..." value={formState.note} onChange={e => setFormState({...formState, note: e.target.value})}></textarea>
                  </div>
                  <button type="submit" className={styles.submitBtn}><FiSend /> Submit Package Tracking</button>
                </form>
              )}
            </div>
          )}

          {/* TAB: My Packages / Manage Parcels */}
          {activeTab === 'packages' && (
            <div className={styles.glassCard}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <h2 className={styles.gradientText} style={{margin: 0}}>
                      {isAdmin ? 'Manage Parcels' : 'Your Packages'}
                    </h2>
                    {isAdmin && (
                      <button 
                        className={styles.submitBtn} 
                        style={{padding: '8px 16px', fontSize: '13px', background: consolidateMode ? '#32cd32' : 'rgba(168, 85, 247, 0.2)', color: consolidateMode ? '#000' : '#a855f7'}} 
                        onClick={() => setConsolidateMode(!consolidateMode)}
                      >
                        <FiLayers /> {consolidateMode ? 'Cancel' : 'Consolidate'}
                      </button>
                    )}
                    {consolidateMode && selectedForConsolidate.length >= 2 && (
                      <button className={styles.submitBtn} style={{padding: '8px 20px', fontSize: '13px'}} onClick={handleConsolidate} disabled={modalLoading}>
                        Merge {selectedForConsolidate.length} Packages
                      </button>
                    )}
                  </div>
                  {isAdmin && (
                    <div style={{display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px'}}>
                      <button className={styles.submitBtn} style={{padding: '6px 12px', fontSize: '12px', background: adminPackageFilter === 'all' ? '#f5c518' : 'rgba(255,255,255,0.05)', color: adminPackageFilter === 'all' ? '#000' : '#fff'}} onClick={() => setAdminPackageFilter('all')}>All</button>
                      <button className={styles.submitBtn} style={{padding: '6px 12px', fontSize: '12px', background: adminPackageFilter === 'pending' ? '#f5c518' : 'rgba(255,255,255,0.05)', color: adminPackageFilter === 'pending' ? '#000' : '#fff'}} onClick={() => setAdminPackageFilter('pending')}>Pending ({packages.filter(p => p.status === 'Pending').length})</button>
                      <button className={styles.submitBtn} style={{padding: '6px 12px', fontSize: '12px', background: adminPackageFilter === 'forwarding' ? '#f5c518' : 'rgba(255,255,255,0.05)', color: adminPackageFilter === 'forwarding' ? '#000' : '#fff'}} onClick={() => setAdminPackageFilter('forwarding')}>Forward Requests ({packages.filter(p => p.status === 'Received' && p.forwardAddress?.city && !p.forwardTrackingId).length})</button>
                      <button className={styles.submitBtn} style={{padding: '6px 12px', fontSize: '12px', background: adminPackageFilter === 'completed' ? '#f5c518' : 'rgba(255,255,255,0.05)', color: adminPackageFilter === 'completed' ? '#000' : '#fff'}} onClick={() => setAdminPackageFilter('completed')}>Completed</button>
                    </div>
                  )}
                </div>
                <div className={styles.searchBar}>
                  <FiSearch />
                  <input type="text" placeholder="Search tracking #, ID, username, city..." value={searchParcels} onChange={e => setSearchParcels(e.target.value)} />
                </div>
              </div>

              {filteredPackages.length === 0 && !searchParcels ? (
                <div style={{textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.4)'}}>
                  <FiPackage size={48} style={{marginBottom: '16px', opacity: 0.5}} />
                  <h3 style={{color: 'rgba(255,255,255,0.5)'}}>No packages submitted yet.</h3>
                  <p style={{fontSize: '14px'}}>When you submit a tracking code, it will appear here.</p>
                  {!isAdmin && <button className={styles.submitBtn} style={{marginTop: '20px', padding: '10px 24px'}} onClick={() => setActiveTab('submit')}>Submit First Package</button>}
                </div>
              ) : filteredPackages.length === 0 && searchParcels ? (
                <div style={{textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.4)'}}>
                  <FiSearch size={36} style={{marginBottom: '12px', opacity: 0.5}} />
                  <h3 style={{color: 'rgba(255,255,255,0.5)'}}>No results for &quot;{searchParcels}&quot;</h3>
                </div>
              ) : (
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        {consolidateMode && <th></th>}
                        <th>Photo</th>
                        <th>Package ID</th>
                        {isAdmin && <th>Username</th>}
                        <th>Tracking ID</th>
                        <th>Weight</th>
                        {isAdmin && <th>Forward To</th>}
                        <th>Status</th>
                        <th>{isAdmin ? 'Action' : 'Details'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPackages.map(p => (
                        <tr key={p.id}>
                          {consolidateMode && (
                            <td>
                              {(p.status === 'Received' || p.status === 'Pending') && (
                                <input 
                                  type="checkbox"
                                  className={styles.consolidateCheck}
                                  checked={selectedForConsolidate.includes(p.id)}
                                  onChange={() => toggleConsolidateSelect(p.id)}
                                />
                              )}
                            </td>
                          )}
                          <td>
                            {p.photoUrl ? (
                              <img src={p.photoUrl} alt="Package" className={styles.pkgThumb} onClick={() => setLightboxUrl(p.photoUrl)} />
                            ) : (
                              <div className={styles.noPhoto}><FiImage /></div>
                            )}
                          </td>
                          <td style={{fontWeight: 600, color: '#fff'}}>
                            {p.id}
                            {p.isConsolidated && <span style={{display: 'block', fontSize: '10px', color: '#a855f7', marginTop: '2px'}}>📦 Consolidated</span>}
                          </td>
                          {isAdmin && <td>{p.username}</td>}
                          <td style={{fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)', fontSize: '13px'}}>{p.trackingId}</td>
                          <td style={{fontSize: '13px', color: 'rgba(255,255,255,0.5)'}}>{p.weight ? `${p.weight} lbs` : '—'}</td>
                          {isAdmin && (
                            <td>
                              {p.forwardAddress ? (
                                <div style={{fontSize: '12px', lineHeight: 1.5}}>
                                  <div style={{color: '#fff', fontWeight: 500}}>{p.forwardAddress.name}</div>
                                  <div style={{color: 'rgba(255,255,255,0.5)'}}>{p.forwardAddress.street}</div>
                                  <div style={{color: 'rgba(255,255,255,0.5)'}}>{p.forwardAddress.city}{p.forwardAddress.state ? `, ${p.forwardAddress.state}` : ''} {p.forwardAddress.zip}</div>
                                  <div style={{color: 'rgba(255,255,255,0.5)'}}>{p.forwardAddress.country}</div>
                                </div>
                              ) : <span style={{fontSize: '12px', color: 'rgba(255,255,255,0.3)'}}>Not provided</span>}
                            </td>
                          )}
                          <td>
                            <span className={`${styles.statusBadge} ${styles['status'+p.status]}`}>{p.status}</span>
                            {p.forwardTrackingId && (
                              <div style={{fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontFamily: 'monospace'}}>→ {p.forwardTrackingId}</div>
                            )}
                          </td>
                          <td>
                            {isAdmin ? (
                              <div className={styles.actionBtnGroup}>
                                {p.status === 'Pending' && (
                                  <button className={`${styles.actionBtn} ${styles.receiveBtn}`} onClick={() => handleOpenReceiveModal(p)}>
                                    <FiCamera /> Receive
                                  </button>
                                )}
                                {p.status === 'Received' && (
                                  <button className={`${styles.actionBtn} ${styles.forwardBtn}`} onClick={() => handleOpenForwardModal(p)}>
                                    <FiTruck /> Forward
                                  </button>
                                )}
                                {p.status === 'Forwarded' && (
                                  <button className={`${styles.actionBtn}`} style={{color: '#32cd32', borderColor: 'rgba(50,205,50,0.3)'}} onClick={() => handleCompleteOrder(p.id)}>
                                    <FiCheckCircle /> Complete Order
                                  </button>
                                )}
                                {p.status === 'Completed' && <span style={{fontSize: '12px', color: 'rgba(255,255,255,0.3)'}}>Complete</span>}
                                {p.status !== 'Consolidated' && (
                                  <button className={`${styles.actionBtn} ${styles.chatBtn}`} onClick={() => handleOpenChat(p)}>
                                    <FiMessageCircle /> Chat
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div>
                                {p.status === 'Received' && !p.forwardTrackingId && !p.forwardAddress?.city && (
                                  <button className={`${styles.actionBtn} ${styles.forwardBtn}`} style={{marginBottom: '8px'}} onClick={() => setUserForwardModal(p)}>
                                    <FiTruck /> Setup Forward
                                  </button>
                                )}
                                {p.status === 'Received' && p.forwardAddress?.city && !p.forwardTrackingId && (
                                  <span style={{fontSize: '11px', color: '#a855f7', display: 'block', marginBottom: '8px'}}>Address Provided</span>
                                )}
                                {p.forwardTrackingId && (
                                  <div className={styles.forwardTrackCard}>
                                    <p className={styles.forwardTrackLabel}>Outgoing Tracking</p>
                                    <p className={styles.forwardTrackValue}>
                                      {p.forwardTrackingId}
                                      <FiCopy style={{cursor: 'pointer', fontSize: '14px', color: 'rgba(255,255,255,0.4)'}} onClick={() => { navigator.clipboard.writeText(p.forwardTrackingId); }} />
                                    </p>
                                  </div>
                                )}
                                <button className={`${styles.actionBtn} ${styles.chatBtn}`} style={{marginTop: p.forwardTrackingId ? '8px' : 0}} onClick={() => handleOpenChat(p)}>
                                  <FiMessageCircle /> Chat
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: Manage Users */}
          {activeTab === 'users' && isAdmin && (
            <>
              <div className={styles.glassCard} style={{marginBottom: '24px'}}>
                <h2 className={styles.gradientText} style={{margin: '0 0 8px'}}>Registered Users</h2>
                <p style={{margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '14px'}}>
                  {allUsers.length} total user{allUsers.length !== 1 ? 's' : ''} registered via Telegram Bot
                </p>
              </div>
              <div className={styles.usersGrid}>
                {allUsers.map((u, i) => {
                  const userPkgs = packages.filter(p => p.username === u.username);
                  const pending = userPkgs.filter(p => p.status === 'Pending').length;
                  const received = userPkgs.filter(p => p.status === 'Received').length;
                  const forwarded = userPkgs.filter(p => p.status === 'Forwarded').length;
                  const userBal = allWallets[u.username]?.balance || 0;
                  return (
                    <div key={i} className={styles.userCard}>
                      <div className={styles.userCardHeader}>
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="Avatar" className={styles.userAvatar} style={{ objectFit: 'cover' }} />
                        ) : (
                          <div className={styles.userAvatar}>{u.username.charAt(0).toUpperCase()}</div>
                        )}
                        <div>
                          <p className={styles.userName}>{u.username}</p>
                          <p className={styles.userTgId}>ID: {u.telegramId}</p>
                        </div>
                      </div>
                      <div className={styles.userStatsRow}>
                        <div className={styles.userStat}><p className={styles.userStatValue} style={{color: '#f5c518'}}>{pending}</p><p className={styles.userStatLabel}>Pending</p></div>
                        <div className={styles.userStat}><p className={styles.userStatValue} style={{color: '#32cd32'}}>{received}</p><p className={styles.userStatLabel}>Received</p></div>
                        <div className={styles.userStat}><p className={styles.userStatValue} style={{color: '#6495ed'}}>{forwarded}</p><p className={styles.userStatLabel}>Forwarded</p></div>
                      </div>
                      <div style={{marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span style={{fontSize: '11px', color: 'rgba(255,255,255,0.3)'}}>
                          {u.createdAt ? `Joined ${new Date(u.createdAt).toLocaleDateString()}` : ''}
                        </span>
                        <span style={{fontSize: '13px', fontWeight: 600, color: '#f5c518'}}>${userBal.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* TAB: Manage Wallets (ADMIN ONLY) */}
          {activeTab === 'wallets' && isAdmin && (
            <div className={styles.glassCard} style={{maxWidth: '600px'}}>
              <h2 className={styles.gradientText} style={{margin: '0 0 24px'}}>Manage Wallet Balances</h2>
              <form onSubmit={handleWalletUpdate}>
                <div className={styles.formGroup}>
                  <label>Select User</label>
                  <select className={styles.select} value={walletForm.username} onChange={e => setWalletForm({...walletForm, username: e.target.value})} required>
                    <option value="">Choose a user...</option>
                    {allUsers.map((u, i) => (
                      <option key={i} value={u.username}>{u.username} — Balance: ${(allWallets[u.username]?.balance || 0).toFixed(2)}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.inlineFormRow}>
                  <div className={styles.formGroup} style={{flex: 1, marginBottom: 0}}>
                    <label>Amount ($)</label>
                    <input type="number" step="0.01" className={styles.input} required value={walletForm.amount} onChange={e => setWalletForm({...walletForm, amount: e.target.value})} placeholder="0.00" />
                  </div>
                  <div className={styles.formGroup} style={{flex: 1, marginBottom: 0}}>
                    <label>Type</label>
                    <select className={styles.select} value={walletForm.type} onChange={e => setWalletForm({...walletForm, type: e.target.value})}>
                      <option value="credit">Credit (+)</option>
                      <option value="debit">Debit (−)</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Note</label>
                  <input className={styles.input} value={walletForm.note} onChange={e => setWalletForm({...walletForm, note: e.target.value})} placeholder="e.g. Shipping fee for PKG-12345" />
                </div>
                <button type="submit" className={styles.submitBtn}><FiDollarSign /> Update Balance</button>
              </form>
            </div>
          )}

          {/* TAB: Owner Wallet (ADMIN ONLY) */}
          {activeTab === 'admin_wallet' && isAdmin && (
            <div className={styles.glassCard} style={{maxWidth: '800px'}}>
              <h2 className={styles.gradientText} style={{margin: '0 0 24px'}}>Owner Crypto Wallet</h2>
              
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px'}}>
                {adminBalances ? (
                  Object.entries(adminBalances).filter(([k]) => k !== 'message' && k !== 'result').map(([currency, amount]) => (
                    <div key={currency} style={{background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)'}}>
                      <div style={{color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '4px'}}>{currency} Balance</div>
                      <div style={{fontSize: '20px', fontWeight: '600', color: '#fff'}}>{parseFloat(amount).toFixed(4)}</div>
                    </div>
                  ))
                ) : (
                  <div style={{color: 'rgba(255,255,255,0.5)', fontSize: '14px'}}>Loading balances...</div>
                )}
              </div>

              <h3 style={{margin: '0 0 16px', fontSize: '16px', color: '#fff'}}>Withdraw Funds</h3>
              <form onSubmit={handleAdminWithdraw}>
                <div className={styles.inlineFormRow}>
                  <div className={styles.formGroup} style={{flex: 1}}>
                    <label>Amount</label>
                    <input type="number" step="0.000001" className={styles.input} required value={withdrawForm.amount} onChange={e => setWithdrawForm({...withdrawForm, amount: e.target.value})} placeholder="0.00" />
                  </div>
                  <div className={styles.formGroup} style={{flex: 1}}>
                    <label>Currency</label>
                    <input type="text" className={styles.input} required value={withdrawForm.currency} onChange={e => setWithdrawForm({...withdrawForm, currency: e.target.value.toUpperCase()})} placeholder="e.g. USDT, TRX" />
                  </div>
                  <div className={styles.formGroup} style={{flex: 1}}>
                    <label>Network</label>
                    <input type="text" className={styles.input} value={withdrawForm.network} onChange={e => setWithdrawForm({...withdrawForm, network: e.target.value.toUpperCase()})} placeholder="e.g. TRC20, ERC20" />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Destination Address</label>
                  <input type="text" className={styles.input} required value={withdrawForm.address} onChange={e => setWithdrawForm({...withdrawForm, address: e.target.value})} placeholder="Enter crypto address" />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={modalLoading}>
                  {modalLoading ? 'Processing...' : <><FiSend /> Submit Withdrawal</>}
                </button>
              </form>
            </div>
          )}

          {/* TAB: Post Review */}
          {activeTab === 'review' && (
            <div className={styles.glassCard} style={{maxWidth: '600px'}}>
              <h2 className={styles.gradientText} style={{margin: '0 0 24px'}}>Post a Review</h2>
              <div style={{background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '16px', textAlign: 'center'}}>
                <FiStar size={48} color="#f5c518" style={{marginBottom: '16px'}} />
                <h3 className={styles.gradientText} style={{margin: '0 0 12px', fontSize: '20px'}}>Have a successful delivery?</h3>
                <p style={{color: 'rgba(255,255,255,0.6)', marginBottom: '24px', fontSize: '14px', lineHeight: 1.6}}>
                  Share your experience with the community. Dropping vouches helps us build trust.
                </p>
                <form onSubmit={handlePostReview}>
                  <textarea className={styles.textarea} placeholder="Write your honest review here..." value={reviewForm.content} onChange={e => setReviewForm({ ...reviewForm, content: e.target.value })} required style={{marginBottom: '15px'}} />
                  <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                    <button type="submit" className={styles.submitBtn} style={{padding: '10px 24px'}}>Publish Vouch</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB: Broadcast Notify */}
          {activeTab === 'notify' && isAdmin && (
            <div className={styles.glassCard} style={{maxWidth: '600px'}}>
              <h2 className={styles.gradientText} style={{margin: '0 0 24px'}}>Broadcast Notification</h2>
              <form onSubmit={handleAdminSendNotif}>
                <div className={styles.formGroup}>
                  <label>Target User</label>
                  <select className={styles.select} value={notifForm.target} onChange={e => setNotifForm({...notifForm, target: e.target.value})}>
                    <option value="ALL">All Users</option>
                    {allUsers.map((u, i) => (<option key={i} value={u.username}>{u.username}</option>))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Notification Title</label>
                  <input className={styles.input} required value={notifForm.title} onChange={e => setNotifForm({...notifForm, title: e.target.value})} placeholder="e.g. System Update" />
                </div>
                <div className={styles.formGroup}>
                  <label>Message</label>
                  <textarea className={styles.textarea} required value={notifForm.message} onChange={e => setNotifForm({...notifForm, message: e.target.value})} placeholder="Notification content..." />
                </div>
                <button type="submit" className={styles.submitBtn}><FiSend /> Send Notification</button>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* ── RECEIVE MODAL ── */}
      {receiveModal && (
        <div className={styles.modalOverlay} onClick={() => !modalLoading && setReceiveModal(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>📦 Receive Package</h3>
            <p className={styles.modalSubtitle}>Mark {receiveModal.id} as received. Photo upload is optional.</p>

            {/* Photo Upload Zone — supports click + Ctrl+V paste */}
            <div 
              className={`${styles.uploadZone} ${photoPreview ? styles.hasPreview : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className={styles.uploadPreview} />
              ) : (
                <>
                  <FiUpload className={styles.uploadIcon} />
                  <p className={styles.uploadText}>Click to upload or Ctrl+V to paste</p>
                  <p className={styles.uploadHint}>JPG, PNG — Optional</p>
                </>
              )}
            </div>
            <input type="file" ref={fileInputRef} className={styles.hiddenInput} accept="image/*" onChange={handlePhotoSelect} />

            {/* Weight & Dimensions */}
            <div className={styles.inlineFormRow}>
              <div className={styles.formGroup} style={{flex: 1, marginBottom: 0}}>
                <label>Weight (lbs)</label>
                <input type="text" className={styles.input} placeholder="e.g. 2.5" value={receiveWeight} onChange={e => setReceiveWeight(e.target.value)} />
              </div>
              <div className={styles.formGroup} style={{flex: 1, marginBottom: 0}}>
                <label>Dimensions</label>
                <input type="text" className={styles.input} placeholder="e.g. 12×8×6" value={receiveDimensions} onChange={e => setReceiveDimensions(e.target.value)} />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={() => { setReceiveModal(null); setPhotoFile(null); setPhotoPreview(null); }} disabled={modalLoading}>Cancel</button>
              <button className={styles.modalConfirmBtn} onClick={handleConfirmReceive} disabled={modalLoading}>
                {modalLoading ? 'Processing...' : <><FiCheckCircle /> Confirm Receive</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FORWARD MODAL ── */}
      {forwardModal && (
        <div className={styles.modalOverlay} onClick={() => !modalLoading && setForwardModal(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>🚀 Forward Package</h3>
            <p className={styles.modalSubtitle}>Ship {forwardModal.id} to the client&apos;s address</p>

            {forwardModal.photoUrl && <img src={forwardModal.photoUrl} alt="Package" className={styles.modalPhotoPreview} />}

            {forwardModal.forwardAddress ? (
              <div className={styles.forwardAddrCard}>
                <p className={styles.forwardAddrLabel}>📍 Ship To</p>
                <p className={styles.forwardAddrText}>{forwardModal.forwardAddress.name}{'\n'}{forwardModal.forwardAddress.street}{'\n'}{forwardModal.forwardAddress.city}{forwardModal.forwardAddress.state ? `, ${forwardModal.forwardAddress.state}` : ''} {forwardModal.forwardAddress.zip}{'\n'}{forwardModal.forwardAddress.country}</p>
              </div>
            ) : (
              <div className={styles.forwardAddrCard} style={{borderColor: 'rgba(255, 59, 48, 0.2)', background: 'rgba(255, 59, 48, 0.06)'}}>
                <p className={styles.forwardAddrLabel} style={{color: '#ff3b30'}}>⚠️ No Forwarding Address</p>
                <p className={styles.forwardAddrText} style={{color: 'rgba(255,255,255,0.5)'}}>Contact client via Telegram for delivery details.</p>
              </div>
            )}

            {forwardModal.weight && (
              <div style={{fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px'}}>
                ⚖️ Weight: <strong style={{color: '#fff'}}>{forwardModal.weight} lbs</strong>
                {forwardModal.dimensions && <> &nbsp;|&nbsp; 📐 Dimensions: <strong style={{color: '#fff'}}>{forwardModal.dimensions}</strong></>}
              </div>
            )}

            <div className={styles.formGroup} style={{marginBottom: '16px'}}>
              <label>Outgoing Tracking Number</label>
              <input type="text" className={styles.input} placeholder="Enter the new outgoing tracking #" value={forwardTrackingInput} onChange={e => setForwardTrackingInput(e.target.value)} />
            </div>

            <div className={styles.formGroup} style={{marginBottom: 0}}>
              <label>Amount to Deduct from Wallet (USD)</label>
              <div style={{position: 'relative'}}>
                <span style={{position: 'absolute', left: '16px', top: '16px', color: 'rgba(255,255,255,0.4)', fontSize: '15px'}}>$</span>
                <input type="number" step="0.01" min="0" className={styles.input} style={{paddingLeft: '32px'}} placeholder="0.00" value={deductionAmount} onChange={e => setDeductionAmount(e.target.value)} />
              </div>
              <p style={{fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0'}}>Leave 0 or empty for no deduction.</p>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={() => setForwardModal(null)} disabled={modalLoading}>Cancel</button>
              <button className={styles.modalConfirmBtn} onClick={handleConfirmForward} disabled={modalLoading || !forwardTrackingInput.trim()}>
                {modalLoading ? 'Processing...' : <><FiTruck /> Confirm Forward</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── USER FORWARD MODAL ── */}
      {userForwardModal && (
        <div className={styles.modalOverlay} onClick={() => !modalLoading && setUserForwardModal(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>📦 {forwardConfirmStep ? 'Confirm Shipment' : 'Setup Forwarding'}</h3>
            <p className={styles.modalSubtitle}>{forwardConfirmStep ? `Review final details for ${userForwardModal.id}` : `Provide your destination address for ${userForwardModal.id}`}</p>

            <form onSubmit={handleUserForwardSubmit}>
              {!forwardConfirmStep ? (
                <>
                  {savedAddresses && savedAddresses.length > 0 && (
                    <div className={styles.formGroup} style={{marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)'}}>
                      <label>Use Saved Address</label>
                      <select className={styles.select} onChange={(e) => {
                        if (e.target.value === '') return;
                        const sAddr = savedAddresses[Number(e.target.value)];
                        setForwardAddress({ 
                          name: sAddr.name, 
                          street: sAddr.street, 
                          city: sAddr.city, 
                          state: sAddr.state || '', 
                          zip: sAddr.zip || '', 
                          country: sAddr.country || '' 
                        });
                      }}>
                        <option value="">Choose a saved address...</option>
                        {savedAddresses.map((sa, i) => (
                          <option key={i} value={i}>{sa.name} - {sa.street}, {sa.city}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label>Recipient Name</label>
                    <input type="text" className={styles.input} placeholder="Full name for the shipping label" value={forwardAddress.name} onChange={e => setForwardAddress({...forwardAddress, name: e.target.value})} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Street Address</label>
                    <input type="text" className={styles.input} placeholder="123 Main St, Apt 4" value={forwardAddress.street} onChange={e => setForwardAddress({...forwardAddress, street: e.target.value})} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>City</label>
                    <input type="text" className={styles.input} placeholder="e.g. London" value={forwardAddress.city} onChange={e => setForwardAddress({...forwardAddress, city: e.target.value})} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>State / Province</label>
                    <input type="text" className={styles.input} placeholder="e.g. NY" value={forwardAddress.state} onChange={e => setForwardAddress({...forwardAddress, state: e.target.value})} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>ZIP / Postal Code</label>
                    <input type="text" className={styles.input} placeholder="e.g. W1D 4AG" value={forwardAddress.zip} onChange={e => setForwardAddress({...forwardAddress, zip: e.target.value})} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Country</label>
                    <input type="text" className={styles.input} placeholder="e.g. United Kingdom" value={forwardAddress.country} onChange={e => setForwardAddress({...forwardAddress, country: e.target.value})} required />
                  </div>

                  <div className={styles.formGroup} style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <input type="checkbox" className={styles.consolidateCheck} id="saveAddrCheck" checked={saveAddressChecked} onChange={e => setSaveAddressChecked(e.target.checked)} />
                    <label htmlFor="saveAddrCheck" style={{marginBottom: 0, cursor: 'pointer', color: '#fff'}}>Save this address for future use</label>
                  </div>

                  <div className={styles.modalActions}>
                    <button type="button" className={styles.modalCancelBtn} onClick={() => { setUserForwardModal(null); setForwardAddress({name:'', street:'', city:'', state:'', zip:'', country:''}); }} disabled={modalLoading}>Cancel</button>
                    <button type="submit" className={styles.modalConfirmBtn} disabled={modalLoading || !forwardAddress.name || !forwardAddress.street || !forwardAddress.city || !forwardAddress.state || !forwardAddress.zip || !forwardAddress.country}>
                      {modalLoading ? 'Saving...' : <>Review Details</>}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.forwardAddrCard}>
                    <p className={styles.forwardAddrLabel}>📍 Ship To</p>
                    <p className={styles.forwardAddrText}>{forwardAddress.name}{'\n'}{forwardAddress.street}{'\n'}{forwardAddress.city}{forwardAddress.state ? `, ${forwardAddress.state}` : ''} {forwardAddress.zip}{'\n'}{forwardAddress.country}</p>
                  </div>
                  <div className={styles.modalActions}>
                    <button type="button" className={styles.modalCancelBtn} onClick={() => setForwardConfirmStep(false)} disabled={modalLoading}>Back</button>
                    <button type="submit" className={styles.modalConfirmBtn} disabled={modalLoading}>
                      {modalLoading ? 'Confirming...' : <><FiTruck /> Confirm Shipment</>}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ── TOP-UP MODAL ── */}
      {topupModal && (
        <div className={styles.modalOverlay} onClick={() => !modalLoading && setTopupModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>💳 Top Up Wallet</h3>
            <p className={styles.modalSubtitle}>Enter an amount in USD to add to your balance.</p>

            <form onSubmit={handleTopupSubmit}>
              <div className={styles.formGroup}>
                <label>Amount (USD)</label>
                <div style={{position: 'relative'}}>
                  <FiDollarSign style={{position: 'absolute', left: '16px', top: '16px', color: 'rgba(255,255,255,0.4)', fontSize: '18px'}} />
                  <input 
                    type="number" 
                    step="0.01"
                    min="1"
                    className={styles.input} 
                    style={{paddingLeft: '44px', fontSize: '16px', fontWeight: 600}}
                    placeholder="25.00" 
                    value={topupAmount} 
                    onChange={e => setTopupAmount(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.modalCancelBtn} onClick={() => setTopupModal(false)} disabled={modalLoading}>Cancel</button>
                <button type="submit" className={styles.modalConfirmBtn} disabled={modalLoading || !topupAmount || topupAmount < 1}>
                  {modalLoading ? 'Processing...' : <><FiDollarSign /> Pay with OxaPay</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CHAT MODAL ── */}
      {chatModal && (
        <div className={styles.modalOverlay} onClick={() => setChatModal(null)}>
          <div className={styles.modalContent} style={{maxWidth: '520px'}} onClick={e => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <div>
                <h3 className={styles.modalTitle}>💬 Package Chat</h3>
                <p className={styles.modalSubtitle} style={{marginBottom: 0}}>{chatModal.id} — {isAdmin ? chatModal.username : 'Admin'}</p>
              </div>
              <button onClick={() => setChatModal(null)} style={{background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '20px', cursor: 'pointer'}}><FiX /></button>
            </div>

            <div className={styles.chatPanel}>
              <div className={styles.chatMessages}>
                {chatLoading ? (
                  <div className={styles.chatEmpty}>Loading messages...</div>
                ) : chatMessages.length === 0 ? (
                  <div className={styles.chatEmpty}>
                    <FiMessageCircle size={32} />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  chatMessages.map(m => (
                    <div key={m.id} className={`${styles.chatBubble} ${m.role === 'admin' ? styles.chatBubbleAdmin : styles.chatBubbleUser}`}>
                      <div className={`${styles.chatSender} ${m.role === 'admin' ? styles.chatSenderAdmin : styles.chatSenderUser}`}>{m.sender}</div>
                      {m.message && <div>{m.message}</div>}
                      {m.imageUrl && <img src={m.imageUrl} alt="Shared" className={styles.chatImage} onClick={() => setLightboxUrl(m.imageUrl)} />}
                      <div className={styles.chatTime}>{new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <div className={styles.chatInputArea}>
                <input 
                  type="text" 
                  className={styles.chatInput} 
                  placeholder="Type a message..." 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); }}}
                />
                <button className={styles.chatSendBtn} onClick={handleSendChat} disabled={!chatInput.trim()}>
                  <FiSend />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PHOTO LIGHTBOX ── */}
      {lightboxUrl && (
        <div className={styles.lightbox} onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="Package photo" className={styles.lightboxImg} />
        </div>
      )}

    </div>
  );
}
