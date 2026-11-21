import { Route, Routes } from 'react-router-dom'
import { Layout, RequireAuth } from '@/components/Layout'
import Home from '@/pages/Home'
import Categories from '@/pages/Categories'
import Catalog from '@/pages/Catalog'
import Cart from '@/pages/Cart'
import Login from '@/pages/Login'
import Checkout from '@/pages/Checkout'
import Orders from '@/pages/Orders'
import OrderDetail from '@/pages/OrderDetail'
import ResetPassword from '@/pages/ResetPassword'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="categorias" element={<Categories />} />
        <Route path="productos" element={<Catalog />} />
        <Route path="carrito" element={<Cart />} />
        <Route path="iniciar-sesion" element={<Login />} />
        <Route path="checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
        <Route path="pedidos" element={<RequireAuth><Orders /></RequireAuth>} />
        <Route path="pedidos/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />
        <Route path="restablecer" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
