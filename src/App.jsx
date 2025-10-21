import React, { useState, useMemo } from 'react'

// --- Reusable UI Components with Enhanced Styling ---

const Card = ({ children, className = '' }) => (
  <div className={`bg-white/70 backdrop-blur-sm border border-slate-200 shadow-md rounded-xl p-6 ${className}`}>
    {children}
  </div>
)

const Button = ({ children, onClick, className = '', type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    className={`bg-sky-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${className}`}
  >
    {children}
  </button>
)

const Input = ({ className = '', ...props }) => (
  <input
    {...props}
    className={`w-full px-4 py-2 bg-white/80 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-300 ${className}`}
  />
)

const Label = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1">{children}</label>
)

// --- MOCK DATA ---
const initialUsers = [
  { id: 1, name: 'R.K. Administrator', email: 'RKADD@gmail.com', address: '123 Admin Way', role: 'System Administrator', password: 'RKADD@147852369' },
]

const initialStores = []
const initialRatings = []

// --- UTILITY HOOK for Sorting ---
const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = useState(config)

  const sortedItems = useMemo(() => {
    let sortableItems = [...items]
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1
        return 0
      })
    }
    return sortableItems
  }, [items, sortConfig])

  const requestSort = (key) => {
    let direction = 'ascending'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  return { items: sortedItems, requestSort, sortConfig }
}

// --- Main App Component ---
export default function App() {
  // Initialize from localStorage when available to persist demo data across reloads
  const loadJson = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : fallback
    } catch (e) {
      console.error('Failed to parse localStorage key', key, e)
      return fallback
    }
  }

  const [users, _setUsers] = useState(() => loadJson('sr_users', initialUsers))
  const [stores, _setStores] = useState(() => loadJson('sr_stores', initialStores))
  const [ratings, _setRatings] = useState(() => loadJson('sr_ratings', initialRatings))

  // wrappers to persist state when updated
  const setUsers = (next) => {
    _setUsers(next)
    try { localStorage.setItem('sr_users', JSON.stringify(next)) } catch (e) { console.error(e) }
  }
  const setStores = (next) => {
    _setStores(next)
    try { localStorage.setItem('sr_stores', JSON.stringify(next)) } catch (e) { console.error(e) }
  }
  const setRatings = (next) => {
    _setRatings(next)
    try { localStorage.setItem('sr_ratings', JSON.stringify(next)) } catch (e) { console.error(e) }
  }
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [currentView, setCurrentView] = useState('role-selection')
  const [selectedRole, setSelectedRole] = useState(null)
  const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false)

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setCurrentView('login')
  }

  const handleLogin = (email, password) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.role === selectedRole)
    if (user) {
      setLoggedInUser(user)
    } else {
      alert('Invalid credentials. Please try again.')
    }
  }

  const handleLogout = () => {
    setLoggedInUser(null)
    setSelectedRole(null)
    setCurrentView('role-selection')
  }

  const handleSignup = (newUser) => {
    if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
      alert("An account with this email already exists.")
      return false
    }
    const userWithId = { ...newUser, id: users.length + 1 }
    setUsers([...users, userWithId])
    alert("Signup successful! Please log in.")
    setCurrentView('login')
    return true
  }

  const updateUserPassword = (userId, newPassword) => {
    setUsers(users.map(u => u.id === userId ? { ...u, password: newPassword } : u))
  }

  const getDashboard = () => {
    if (!loggedInUser) return <RoleSelectionScreen onRoleSelect={handleRoleSelect} />

    switch (loggedInUser.role) {
      case 'System Administrator':
        return <AdminDashboard users={users} setUsers={setUsers} stores={stores} setStores={setStores} ratings={ratings} adminId={loggedInUser.id} />
      case 'Normal User':
        return <UserDashboard stores={stores} user={loggedInUser} ratings={ratings} setRatings={setRatings} />
      case 'Store Owner':
        return <StoreOwnerDashboard stores={stores} setStores={setStores} user={loggedInUser} ratings={ratings} users={users} />
      default:
        return <p>Error: Role not recognized.</p>
    }
  }

  return (
    <div className="bg-gradient-to-br from-sky-50 to-slate-200 min-h-screen font-sans text-slate-800">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-sky-600">StoreRating</div>
          {loggedInUser && (
            <div className="flex items-center space-x-4">
              <span className="text-slate-700 hidden sm:block">Welcome, {loggedInUser.name.split(' ')[0]}!</span>
              <Button onClick={() => setChangePasswordModalOpen(true)} className="bg-slate-200 text-slate-800 hover:bg-slate-300">Change Password</Button>
              <Button onClick={handleLogout}>Logout</Button>
            </div>
          )}
        </nav>
      </header>
      <main className="container mx-auto px-6 py-8">
        {currentView !== 'role-selection' && !loggedInUser ? (
          <LoginSignup
            view={currentView}
            setView={setCurrentView}
            onLogin={handleLogin}
            onSignup={handleSignup}
            role={selectedRole}
            onBack={() => { setCurrentView('role-selection'); setSelectedRole(null); }}
          />
        ) : (
          getDashboard()
        )}
      </main>
      {isChangePasswordModalOpen && (
        <ChangePasswordModal
          user={loggedInUser}
          onClose={() => setChangePasswordModalOpen(false)}
          onPasswordUpdate={updateUserPassword}
        />
      )}
    </div>
  )
}

// --- Role-Specific Components ---

const RoleSelectionScreen = ({ onRoleSelect }) => {
  const roles = [
    { name: 'System Administrator', description: 'Manage users, stores, and system data.', icon: '⚙' },
    { name: 'Store Owner', description: 'Manage your store details and view ratings.', icon: '🏪' },
    { name: 'Normal User', description: 'Discover, rate, and review stores.', icon: '👤' }
  ]

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4">Welcome to StoreRating</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Your one-stop platform for store feedback. Please select your role to continue.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {roles.map((role) => (
          <div key={role.name} onClick={() => onRoleSelect(role.name)} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer text-center group">
            <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{role.icon}</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{role.name}</h2>
            <p className="text-slate-600">{role.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const AdminDashboard = ({ users, setUsers, stores, setStores, ratings, adminId }) => {
  // --- Add User Form available only to admin ---
  const AddUserForm = ({ users, setUsers }) => {
    const [form, setForm] = useState({ name: '', email: '', address: '', role: 'Normal User', password: '' })
    const [error, setError] = useState('')
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const reset = () => setForm({ name: '', email: '', address: '', role: 'Normal User', password: '' })

    const handleSubmit = (e) => {
      e.preventDefault()
      setError('')
      // Basic validation
      if (form.name.trim().length < 3) return setError('Name must be at least 3 characters')
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Invalid email')
      if (users.some(u => u.email.toLowerCase() === form.email.toLowerCase())) return setError('An account with this email already exists.')
      if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(form.password)) return setError('Password must be 8-16 chars with one uppercase and one special char')

      const nextId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1
      const newUser = { id: nextId, name: form.name.trim(), email: form.email.trim(), address: form.address.trim(), role: form.role, password: form.password }
      setUsers([...users, newUser])
      reset()
      alert('User added successfully')
    }

    return (
      <Card className="mb-6">
        <h3 className="text-xl font-bold mb-3">Add New User</h3>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><Label htmlFor="au_name">Full Name</Label><Input id="au_name" name="name" value={form.name} onChange={handleChange} required /></div>
          <div><Label htmlFor="au_email">Email</Label><Input id="au_email" name="email" type="email" value={form.email} onChange={handleChange} required /></div>
          <div><Label htmlFor="au_address">Address</Label><Input id="au_address" name="address" value={form.address} onChange={handleChange} /></div>
          <div><Label htmlFor="au_role">Role</Label>
            <select id="au_role" name="role" value={form.role} onChange={handleChange} className="w-full px-4 py-2 bg-white/80 border border-slate-300 rounded-lg">
              <option>Normal User</option>
              <option>Store Owner</option>
              <option>System Administrator</option>
            </select>
          </div>
          <div><Label htmlFor="au_password">Password</Label><Input id="au_password" name="password" type="password" value={form.password} onChange={handleChange} required /></div>
          <div className="flex items-end"><Button type="submit" className="w-full">Add User</Button></div>
        </form>
      </Card>
    )
  }
  const { items: sortedUsers, requestSort: requestUserSort, sortConfig: userSortConfig } = useSortableData(users)
  const { items: sortedStores, requestSort: requestStoreSort, sortConfig: storeSortConfig } = useSortableData(stores)

  const getOverallRating = (storeId) => {
    const storeRatings = ratings.filter(r => r.storeId === storeId)
    if (storeRatings.length === 0) return 'N/A'
    const avg = storeRatings.reduce((acc, r) => acc + r.rating, 0) / storeRatings.length
    return avg.toFixed(1)
  }

  const removeUser = (userId) => {
    if(userId === adminId) {
      alert("You cannot remove the main administrator account.")
      return
    }
    if(window.confirm("Are you sure you want to remove this user? This is irreversible.")) {
      setUsers(users.filter(u => u.id !== userId))
    }
  }

  const removeStore = (storeId) => {
    if(window.confirm("Are you sure you want to remove this store? This is irreversible.")) {
      setStores(stores.filter(s => s.id !== storeId))
    }
  }

  const getSortIndicator = (key, config) => {
    if (!config || config.key !== key) return null
    return config.direction === 'ascending' ? ' ▲' : ' ▼'
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-slate-800">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><div className="flex items-center"><div className="text-3xl mr-4">👥</div><div><h3 className="text-xl font-bold text-slate-600">Total Users</h3><p className="text-3xl mt-1 font-semibold">{users.length}</p></div></div></Card>
        <Card><div className="flex items-center"><div className="text-3xl mr-4">🏠</div><div><h3 className="text-xl font-bold text-slate-600">Total Stores</h3><p className="text-3xl mt-1 font-semibold">{stores.length}</p></div></div></Card>
        <Card><div className="flex items-center"><div className="text-3xl mr-4">⭐</div><div><h3 className="text-xl font-bold text-slate-600">Total Ratings</h3><p className="text-3xl mt-1 font-semibold">{ratings.length}</p></div></div></Card>
      </div>

      {/* Admin-only actions: Add user form */}
      <AddUserForm users={users} setUsers={setUsers} />

      <Card>
        <h2 className="text-2xl font-bold mb-4 text-slate-700">Manage Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="p-3 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => requestUserSort('name')}>Name{getSortIndicator('name', userSortConfig)}</th>
                <th className="p-3 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => requestUserSort('email')}>Email{getSortIndicator('email', userSortConfig)}</th>
                <th className="p-3 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => requestUserSort('address')}>Address{getSortIndicator('address', userSortConfig)}</th>
                <th className="p-3 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => requestUserSort('role')}>Role{getSortIndicator('role', userSortConfig)}</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map(user => (
                <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.address}</td>
                  <td className="p-3">{user.role}</td>
                  <td className="p-3"><Button onClick={() => removeUser(user.id)} className="bg-red-500 hover:bg-red-600 text-sm py-1 px-2">Remove</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-bold mb-4 text-slate-700">Manage Stores</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="p-3 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => requestStoreSort('name')}>Name{getSortIndicator('name', storeSortConfig)}</th>
                <th className="p-3 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => requestStoreSort('address')}>Address{getSortIndicator('address', storeSortConfig)}</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedStores.map(store => (
                <tr key={store.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="p-3">{store.name}</td>
                  <td className="p-3">{store.address}</td>
                  <td className="p-3 font-semibold">{getOverallRating(store.id)}</td>
                  <td className="p-3"><Button onClick={() => removeStore(store.id)} className="bg-red-500 hover:bg-red-600 text-sm py-1 px-2">Remove</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}


const UserDashboard = ({ stores, user, ratings, setRatings }) => {
  const [search, setSearch] = useState('')
  const [isRatingModalOpen, setRatingModalOpen] = useState(false)
  const [selectedStore, setSelectedStore] = useState(null)
  const [currentRating, setCurrentRating] = useState(0)

  const openRatingModal = (store) => {
    const userRating = ratings.find(r => r.storeId === store.id && r.userId === user.id)
    setCurrentRating(userRating ? userRating.rating : 0)
    setSelectedStore(store)
    setRatingModalOpen(true)
  }

  const closeRatingModal = () => {
    setRatingModalOpen(false)
    setSelectedStore(null)
    setCurrentRating(0)
  }

  const handleRatingSubmit = () => {
    const existingRatingIndex = ratings.findIndex(r => r.storeId === selectedStore.id && r.userId === user.id)
    const newRatings = [...ratings]

    if (existingRatingIndex > -1) {
      newRatings[existingRatingIndex] = { ...newRatings[existingRatingIndex], rating: currentRating }
    } else {
      newRatings.push({ id: ratings.length + 1, userId: user.id, storeId: selectedStore.id, rating: currentRating })
    }
    setRatings(newRatings)
    closeRatingModal()
  }

  const getStoreInfo = (storeId) => {
    const userRatingObj = ratings.find(r => r.userId === user.id && r.storeId === storeId)
    const storeRatings = ratings.filter(r => r.storeId === storeId)
    const overallRating = storeRatings.length > 0 ? (storeRatings.reduce((sum, r) => sum + r.rating, 0) / storeRatings.length).toFixed(1) : 'N/A'
    return { userRating: userRatingObj, overallRating }
  }

  const filteredStores = stores.filter(store => (store.name.toLowerCase().includes(search.toLowerCase()) || store.address.toLowerCase().includes(search.toLowerCase())) && store.ownerId)

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-slate-800">Find Stores</h2>
      <Card><Input type="text" placeholder="Search for stores by name or address..." value={search} onChange={e => setSearch(e.target.value)} /></Card>
      {filteredStores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map(store => {
            const { userRating, overallRating } = getStoreInfo(store.id)
            return (<Card key={store.id} className="flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div><h3 className="text-xl font-bold">{store.name}</h3><p className="text-slate-600 mt-1">{store.address}</p></div>
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-2"><p><strong>Overall Rating:</strong> <span className="font-bold text-sky-600">{overallRating} ★</span></p><p><strong>Your Rating:</strong> {userRating ? `${userRating.rating} ★` : 'Not rated'}</p></div>
              <Button className="mt-4 w-full" onClick={() => openRatingModal(store)}>{userRating ? 'Modify Rating' : 'Submit Rating'}</Button>
            </Card>)
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <p className="text-slate-600 text-lg">Store is yet to be added. Thanks for logging in!</p>
        </Card>
      )}

      {isRatingModalOpen && <RatingModal store={selectedStore} currentRating={currentRating} setCurrentRating={setCurrentRating} onClose={closeRatingModal} onSubmit={handleRatingSubmit} />}
    </div>
  )
}

const StoreOwnerDashboard = ({ stores, setStores, user, ratings, users }) => {
  const ownerStore = stores.find(s => s.ownerId === user.id)
  const [isEditingName, setIsEditingName] = useState(false)

  if (!ownerStore) {
    return <AddStoreForm ownerId={user.id} stores={stores} setStores={setStores} />
  }

  const storeRatings = ratings.filter(r => r.storeId === ownerStore.id)
  const averageRating = storeRatings.length > 0 ? (storeRatings.reduce((acc, r) => acc + r.rating, 0) / storeRatings.length).toFixed(1) : "N/A"

  const handleNameUpdate = (e) => {
    e.preventDefault()
    const newName = e.target.elements.storeName.value
    if (newName) {
      setStores(stores.map(s => s.id === ownerStore.id ? { ...s, name: newName } : s))
    }
    setIsEditingName(false)
  }

  return (
    <div className="space-y-8">
      <Card>
        <div className="flex justify-between items-start">
          <div>
            {!isEditingName ? (
              <h1 className="text-4xl font-bold text-slate-800">{ownerStore.name}</h1>
            ) : (
              <form onSubmit={handleNameUpdate} className="flex items-center gap-2">
                <Input defaultValue={ownerStore.name} name="storeName" />
                <Button type="submit" className="text-sm">Save</Button>
              </form>
            )}
            <p className="text-slate-600 mt-1">{ownerStore.address}</p>
          </div>
          <Button onClick={() => setIsEditingName(!isEditingName)} className="bg-slate-200 text-slate-800 text-sm">{isEditingName ? 'Cancel' : 'Edit Name'}</Button>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h3 className="text-2xl font-bold">Overall Rating: <span className="text-sky-600">{averageRating} ★</span></h3>
        </div>
      </Card>
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-slate-700">Ratings Received</h2>
        {storeRatings.length > 0 ? (
          <ul className="space-y-4">
            {storeRatings.map(rating => {
              const rater = users.find(u => u.id === rating.userId)
              return (
                <li key={rating.id} className="p-4 bg-slate-50 rounded-lg flex justify-between items-center border border-slate-200">
                  <div>
                    <p className="font-semibold">{rater ? rater.name : 'Unknown User'}</p>
                    <p className="text-sm text-slate-500">{rater ? rater.email : ''}</p>
                  </div>
                  <p className="text-xl font-bold text-yellow-500">{rating.rating} ★</p>
                </li>
              )
            })}
          </ul>
        ) : (
          <p>Your store has not received any ratings yet.</p>
        )}
      </Card>
    </div>
  )
}


// --- FORMS and MODALS ---

const LoginSignup = ({ view, setView, onLogin, onSignup, role, onBack }) => {
  const [formData, setFormData] = useState({ name: '', email: '', address: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const validate = () => {
    const newErrors = {}
    if (view === 'signup') {
      if (formData.name.length < 3 || formData.name.length > 60) newErrors.name = 'Name must be between 3 and 60 characters.'
      if (formData.address.length > 400) newErrors.address = 'Address must be max 400 characters.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format.'
      if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(formData.password)) newErrors.password = 'Password must be 8-16 characters with one uppercase letter and one special character.'
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (view === 'login' || validate()) {
      if (view === 'login') onLogin(formData.email, formData.password)
      else onSignup({ name: formData.name, email: formData.email, address: formData.address, password: formData.password, role: role })
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <button onClick={onBack} className="text-sky-600 hover:underline mb-4">&larr; Back to Role Selection</button>
      <h1 className="text-3xl font-bold text-center mb-2 text-slate-800">{view === 'login' ? 'Login' : 'Sign Up'}</h1>
      <p className="text-center text-slate-600 mb-6">as a <span className="font-semibold">{role}</span></p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {view === 'signup' && (
          <>
            <div><Label htmlFor="name">Full Name</Label><Input name="name" id="name" value={formData.name} onChange={handleChange} /><p className="text-red-500 text-xs mt-1">{errors.name}</p></div>
            <div><Label htmlFor="address">Address</Label><Input name="address" id="address" value={formData.address} onChange={handleChange} /><p className="text-red-500 text-xs mt-1">{errors.address}</p></div>
          </>
        )}
        <div><Label htmlFor="email">Email Address</Label><Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} /><p className="text-red-500 text-xs mt-1">{errors.email}</p></div>
        <div><Label htmlFor="password">Password</Label><Input type="password" name="password" id="password" value={formData.password} onChange={handleChange} /><p className="text-red-500 text-xs mt-1">{errors.password}</p></div>
        {view === 'signup' && (
          <div><Label htmlFor="confirmPassword">Confirm Password</Label><Input type="password" name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} /><p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p></div>
        )}
        <Button type="submit" className="w-full !mt-6">{view === 'login' ? 'Login' : 'Create Account'}</Button>
      </form>
      <div className="text-center mt-4 text-sm">
        {view === 'login' && role !== 'System Administrator' && (
          <p className="text-slate-600">Don't have an account? <button onClick={() => setView('signup')} className="font-semibold text-sky-600 hover:underline">Sign Up</button></p>
        )}
        {view === 'signup' && (
          <p className="text-slate-600">Already have an account? <button onClick={() => setView('login')} className="font-semibold text-sky-600 hover:underline">Log In</button></p>
        )}
      </div>
    </Card>
  )
}

const AddStoreForm = ({ ownerId, stores, setStores }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    const { name, address } = e.target.elements
    const newStore = { id: stores.length + 1, name: name.value, address: address.value, ownerId: ownerId }
    setStores([...stores, newStore])
  }

  return (
    <Card className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-slate-700">Add Your Store Details</h2>
      <p className="mb-6 text-slate-600">You haven't added a store yet. Please provide your store's information to get started.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><Label htmlFor="name">Store Name</Label><Input id="name" name="name" placeholder="e.g., The Corner Cafe" required /></div>
        <div><Label htmlFor="address">Store Address</Label><Input id="address" name="address" placeholder="e.g., 123 Main St, Anytown" required /></div>
        <Button type="submit" className="w-full !mt-6">Save Store</Button>
      </form>
    </Card>
  )
}

const ModalWrapper = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20" onClick={onClose}>
    <div className="animate-fade-in-up" onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
)

const RatingModal = ({ store, currentRating, setCurrentRating, onClose, onSubmit }) => (
  <ModalWrapper onClose={onClose}>
    <Card className="w-full max-w-sm">
      <h3 className="text-2xl font-bold mb-2">Rate {store?.name}</h3>
      <p className="mb-4 text-slate-600">Select a rating from 1 to 5.</p>
      <div className="flex justify-center space-x-2 text-4xl mb-6">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={`cursor-pointer transition-all duration-200 transform hover:scale-125 ${star <= currentRating ? 'text-yellow-400' : 'text-slate-300'}`} onClick={() => setCurrentRating(star)}>★</span>
        ))}
      </div>
      <div className="flex justify-end space-x-3">
        <Button onClick={onClose} className="bg-slate-300 text-slate-800 hover:bg-slate-400">Cancel</Button>
        <Button onClick={onSubmit}>Submit</Button>
      </div>
    </Card>
  </ModalWrapper>
)


const ChangePasswordModal = ({ user, onClose, onPasswordUpdate }) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (user.password !== currentPassword) {
      setError('Current password is incorrect.')
      return
    }
    if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(newPassword)) {
      setError('New password must be 8-16 characters with one uppercase letter and one special character.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    onPasswordUpdate(user.id, newPassword)
    alert('Password updated successfully!')
    onClose()
  }

  return (
    <ModalWrapper onClose={onClose}>
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-slate-700">Change Password</h2>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label htmlFor="currentPassword">Current Password</Label><Input type="password" id="currentPassword" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required /></div>
          <div><Label htmlFor="newPassword">New Password</Label><Input type="password" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} required /></div>
          <div><Label htmlFor="confirmPassword">Confirm New Password</Label><Input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required /></div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" onClick={onClose} className="bg-slate-300 text-slate-800 hover:bg-slate-400">Cancel</Button>
            <Button type="submit">Update Password</Button>
          </div>
        </form>
      </Card>
    </ModalWrapper>
  )
}
