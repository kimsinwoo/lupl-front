import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { LogOut, Plus, Edit, Trash2, Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { Product } from '../data/products';
import { toast } from 'sonner';
import api from '../utils/api';

// 공용 Select 스타일
const selectStyles = {
  trigger:
    "h-9 w-[160px] justify-between rounded-md border border-neutral-300 bg-white px-3 " +
    "text-[13px] text-neutral-800 shadow-sm hover:bg-neutral-50 " +
    "focus:outline-none focus:ring-2 focus:ring-neutral-900/10 " +
    "data-[placeholder]:text-neutral-400",

  content:
    "z-50 bg-white border border-neutral-200 rounded-lg shadow-2xl p-1 " +
    "min-w-[160px] max-h-64 overflow-auto",

  item:
    "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 " +
    "text-[13px] text-neutral-800 outline-none " +
    "data-[disabled]:opacity-50 data-[highlighted]:bg-neutral-100 " +
    "data-[state=checked]:bg-neutral-900 data-[state=checked]:text-white"
} as const;

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export const AdminDashboard = ({ onNavigate }: AdminDashboardProps) => {
  const { logout, products, orders, isLoading, loadProducts, loadOrders, addProduct, updateProduct, deleteProduct, updateOrderStatus, refreshData } = useAdmin();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Load data on mount
  useEffect(() => {
    loadProducts();
    loadOrders();
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCategories = async () => {
    try {
      console.log('🔍 Loading categories from API...');
      const response = await api.get('/categories');
      console.log('📦 Categories API response:', response);
      // api.get returns response.data from axios
      if (response && response.success && Array.isArray(response.data)) {
        setCategories(response.data);
        console.log('✅ Categories loaded:', response.data.length);
      } else if (Array.isArray(response)) {
        // If response is directly an array (already unwrapped)
        setCategories(response);
        console.log('✅ Categories loaded (array):', response.length);
      } else if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
        // Another nested structure
        setCategories(response.data.data);
        console.log('✅ Categories loaded (nested):', response.data.data.length);
      } else {
        console.error('❌ Failed to load categories: invalid response structure', response);
        // Fallback to default categories if API fails
        setCategories([
          { id: '1', name: '상의', nameEn: 'Tops' },
          { id: '2', name: '하의', nameEn: 'Bottoms' },
          { id: '3', name: '아우터', nameEn: 'Outerwear' },
          { id: '4', name: '악세서리', nameEn: 'Accessories' }
        ]);
        console.log('✅ Using fallback categories');
      }
    } catch (error) {
      console.error('❌ Failed to load categories:', error);
      // Fallback to default categories on error
      setCategories([
        { id: '1', name: '상의', nameEn: 'Tops' },
        { id: '2', name: '하의', nameEn: 'Bottoms' },
        { id: '3', name: '아우터', nameEn: 'Outerwear' },
        { id: '4', name: '악세서리', nameEn: 'Accessories' }
      ]);
      console.log('✅ Using fallback categories');
    }
  };

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  // Calculate statistics (convert KRW to USD for display)
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total / 1300), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalProducts = products.length;
  const recentOrders = orders.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddProduct = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const sizes = (formData.get('sizes') as string).split(',').map(s => s.trim()).filter(s => s);
    const colors = (formData.get('colors') as string).split(',').map(c => c.trim()).filter(c => c);
    
    // Create variants from sizes and colors
    const variants: any[] = [];
    const productName = formData.get('name') as string;
    for (const size of sizes) {
      for (const color of colors) {
        variants.push({
          size,
          color,
          sku: `${productName}-${size}-${color}`.toUpperCase().replace(/\s+/g, '-'),
          stock: 100
        });
      }
    }
    
    const categoryId = formData.get('category') as string;
    if (!categoryId) {
      toast.error('카테고리를 선택해주세요');
      return;
    }

    const newProduct = {
      name: productName,
      nameEn: productName,
      price: Number(formData.get('price')),
      sku: `${productName}-MAIN`.toUpperCase().replace(/\s+/g, '-'),
      slug: productName.toLowerCase().replace(/\s+/g, '-'),
      description: formData.get('description') as string || '',
      images: formData.get('image') ? JSON.stringify([formData.get('image')]) : '[]',
      categoryId,
      status: 'active',
      variants
    };

    try {
      await addProduct(newProduct);
      setIsAddDialogOpen(false);
      // Reset form
      (e.target as HTMLFormElement).reset();
      toast.success('상품이 성공적으로 추가되었습니다');
    } catch (error: any) {
      console.error('❌ Failed to add product:', error);
      toast.error(error?.message || '상품 추가에 실패했습니다');
    }
  };

  const handleUpdateProduct = async (e: any) => {
    e.preventDefault();
    if (!editingProduct) return;

    const formData = new FormData(e.currentTarget);
    
    const updatedProduct: any = {
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      description: formData.get('description') as string,
      images: formData.get('image') ? JSON.stringify([formData.get('image')]) : editingProduct.image || '[]',
      categoryId: formData.get('category') as string,
      gender: formData.get('gender') as string,
      careInfo: formData.get('careInfo') as string,
      composition: formData.get('composition') as string,
    };

    try {
      await updateProduct(editingProduct.id, updatedProduct);
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    } catch (error) {
      // Error toast is handled in AdminContext
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
      } catch (error) {
        // Error toast is handled in AdminContext
      }
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status as any);
    } catch (error) {
      // Error toast is handled in AdminContext
    }
  };

  if (isLoading && products.length === 0 && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg tracking-[0.15em]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 sm:pt-32 pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <div>
            <h1 className="text-3xl tracking-[0.2em] mb-2">ADMIN DASHBOARD</h1>
            <p className="text-sm text-muted-foreground tracking-[0.15em]">
              Manage your KITAE store
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <Button
              onClick={refreshData}
              variant="outline"
              className="tracking-[0.15em]"
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="tracking-[0.15em] gap-2"
            >
              <LogOut className="w-4 h-4" />
              LOGOUT
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground tracking-[0.1em] mb-2">TOTAL REVENUE</p>
            <p className="text-2xl tracking-[0.1em]">${totalRevenue.toLocaleString()}</p>
          </div>

          <div className="bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground tracking-[0.1em] mb-2">TOTAL ORDERS</p>
            <p className="text-2xl tracking-[0.1em]">{orders.length}</p>
          </div>

          <div className="bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-muted-foreground tracking-[0.1em] mb-2">PRODUCTS</p>
            <p className="text-2xl tracking-[0.1em]">{totalProducts}</p>
          </div>

          <div className="bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-sm text-muted-foreground tracking-[0.1em] mb-2">PENDING ORDERS</p>
            <p className="text-2xl tracking-[0.1em]">{pendingOrders}</p>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="products" className="tracking-[0.15em]">
              PRODUCTS
            </TabsTrigger>
            <TabsTrigger value="orders" className="tracking-[0.15em]">
              ORDERS
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl tracking-[0.15em]">PRODUCT MANAGEMENT</h2>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="tracking-[0.15em] gap-2">
                    <Plus className="w-4 h-4" />
                    ADD PRODUCT
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="tracking-[0.15em]">ADD NEW PRODUCT</DialogTitle>
                    <DialogDescription>
                      Add a new product to your catalog
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input id="name" name="name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input id="price" name="price" type="number" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">Image URL</Label>
                      <Input id="image" name="image" type="url" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select name="category" required>
                          <SelectTrigger className={selectStyles.trigger}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className={selectStyles.content} position="popper" sideOffset={8}>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id} className={selectStyles.item}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select name="gender" required>
                          <SelectTrigger className={selectStyles.trigger}>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent className={selectStyles.content} position="popper" sideOffset={8}>
                            <SelectItem value="women" className={selectStyles.item}>Women</SelectItem>
                            <SelectItem value="men" className={selectStyles.item}>Men</SelectItem>
                            <SelectItem value="unisex" className={selectStyles.item}>Unisex</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sizes">Sizes (comma separated)</Label>
                        <Input id="sizes" name="sizes" placeholder="XS, S, M, L, XL" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="colors">Colors (comma separated)</Label>
                        <Input id="colors" name="colors" placeholder="Black, White, Cream" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="careInfo">Care Information</Label>
                      <Input id="careInfo" name="careInfo" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="composition">Composition</Label>
                      <Input id="composition" name="composition" required />
                    </div>

                    <Button type="submit" className="w-full tracking-[0.15em]">
                      ADD PRODUCT
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Mobile: Card View */}
            <div className="block sm:hidden space-y-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white shadow-sm rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium tracking-[0.05em] truncate text-sm">{product.name}</h3>
                      <div className="mt-1 space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-[0.1em]">
                          {product.category}
                        </p>
                        <p className="text-lg font-semibold">${product.price}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-[0.1em]">
                          {product.gender}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        setEditingProduct(product);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table View */}
            <div className="hidden sm:block bg-white shadow-sm overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IMAGE</TableHead>
                    <TableHead>NAME</TableHead>
                    <TableHead>CATEGORY</TableHead>
                    <TableHead>PRICE</TableHead>
                    <TableHead>GENDER</TableHead>
                    <TableHead className="text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover"
                          style={{ maxWidth: '200px', maxHeight: '200px' }}
                        />
                      </TableCell>
                      <TableCell className="tracking-[0.05em]">{product.name}</TableCell>
                      <TableCell className="uppercase text-xs tracking-[0.1em]">
                        {product.category}
                      </TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell className="uppercase text-xs tracking-[0.1em]">
                        {product.gender}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingProduct(product);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-xl tracking-[0.15em]">ORDER MANAGEMENT</h2>

            {/* Mobile: Card View */}
            <div className="block sm:hidden space-y-4">
              {orders.map((order) => (
                <div 
                  key={order.id}
                  className="bg-white shadow-sm rounded-lg p-4 space-y-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setSelectedOrder(order);
                    setIsOrderDialogOpen(true);
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground tracking-[0.1em] mb-1">ORDER ID</p>
                      <p className="font-medium text-sm truncate">{order.id}</p>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} text-xs flex-shrink-0`}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Date</p>
                      <p className="text-xs">{order.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total</p>
                      <p className="font-semibold">${((order.total ?? 0) / 1300).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Customer</p>
                    <p className="text-sm font-medium truncate">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground truncate">{order.email}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t gap-2">
                    {order.paymentStatus === 'paid' ? (
                      <>
                        <Badge className="bg-green-100 text-green-800 text-xs flex-shrink-0">PAID</Badge>
                        <Select
                          defaultValue={order.status}
                          onValueChange={(value) => handleOrderStatusChange(order.id, value)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SelectTrigger className="h-8 text-xs w-full sm:w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className={selectStyles.content}>
                            <SelectItem className={selectStyles.item} value="pending">Pending</SelectItem>
                            <SelectItem className={selectStyles.item} value="processing">Processing</SelectItem>
                            <SelectItem className={selectStyles.item} value="shipped">Shipped</SelectItem>
                            <SelectItem className={selectStyles.item} value="delivered">Delivered</SelectItem>
                            <SelectItem className={selectStyles.item} value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs w-full text-center">
                        결제 대기
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table View */}
            <div className="hidden sm:block bg-white shadow-sm overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ORDER ID</TableHead>
                    <TableHead>DATE</TableHead>
                    <TableHead>CUSTOMER</TableHead>
                    <TableHead>TOTAL</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead>PAYMENT</TableHead>
                    <TableHead className="text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow 
                      key={order.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsOrderDialogOpen(true);
                      }}
                    >
                      <TableCell className="tracking-[0.1em]">{order.id}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>
                        <div>
                          <p className="tracking-[0.05em]">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>${((order.total ?? 0) / 1300).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.paymentStatus === 'paid' ? (
                          <Badge className="bg-green-100 text-green-800">
                            PAID
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                            PENDING
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        {order.paymentStatus === 'paid' ? (
                          <Select
                            defaultValue={order.status}
                            onValueChange={(value) => handleOrderStatusChange(order.id, value)}
                          >
                            <SelectTrigger className={selectStyles.trigger}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                              className={selectStyles.content}
                              position="popper"
                              sideOffset={8}
                              align="end"
                            >
                              <SelectItem className={selectStyles.item} value="pending">Pending</SelectItem>
                              <SelectItem className={selectStyles.item} value="processing">Processing</SelectItem>
                              <SelectItem className={selectStyles.item} value="shipped">Shipped</SelectItem>
                              <SelectItem className={selectStyles.item} value="delivered">Delivered</SelectItem>
                              <SelectItem className={selectStyles.item} value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600">
                            결제 대기
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Order Detail Dialog */}
        <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="tracking-[0.15em]">ORDER DETAILS</DialogTitle>
              <DialogDescription>
                Order ID: {selectedOrder?.id || selectedOrder?.orderNumber}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold tracking-[0.1em]">CUSTOMER INFORMATION</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedOrder.customerName || selectedOrder.shippingName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedOrder.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedOrder.shippingPhone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold tracking-[0.1em]">SHIPPING ADDRESS</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <p className="font-medium">{selectedOrder.shippingName || selectedOrder.customerName}</p>
                    <p>{selectedOrder.shippingAddress1 || 'N/A'}</p>
                    {selectedOrder.shippingAddress2 && (
                      <p>{selectedOrder.shippingAddress2}</p>
                    )}
                    <p>
                      {selectedOrder.shippingCity || 'N/A'}, {selectedOrder.shippingZip || 'N/A'} {selectedOrder.shippingCountry || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold tracking-[0.1em]">ORDER ITEMS</h3>
                  <div className="space-y-3">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.size} / {item.color} - Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold">${((item.price || 0) / 1300).toFixed(2)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No items found</p>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${((selectedOrder.total ?? 0) / 1300).toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status.toUpperCase()}
                    </Badge>
                    {selectedOrder.paymentStatus === 'paid' ? (
                      <Badge className="bg-green-100 text-green-800">PAID</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">PENDING</Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        {editingProduct && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="tracking-[0.15em]">EDIT PRODUCT</DialogTitle>
                <DialogDescription>
                  Update product information
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateProduct} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Product Name</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      defaultValue={editingProduct.name}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Price ($)</Label>
                    <Input
                      id="edit-price"
                      name="price"
                      type="number"
                      defaultValue={editingProduct.price}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-image">Image URL</Label>
                  <Input
                    id="edit-image"
                    name="image"
                    type="url"
                    defaultValue={editingProduct.image}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select name="category" defaultValue={editingProduct.category}>
                      <SelectTrigger className={selectStyles.trigger}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={selectStyles.content} position="popper" sideOffset={8}>
                        <SelectItem value="tops" className={selectStyles.item}>Tops</SelectItem>
                        <SelectItem value="bottoms" className={selectStyles.item}>Bottoms</SelectItem>
                        <SelectItem value="outerwear" className={selectStyles.item}>Outerwear</SelectItem>
                        <SelectItem value="accessories" className={selectStyles.item}>Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-gender">Gender</Label>
                    <Select name="gender" defaultValue={editingProduct.gender}>
                      <SelectTrigger className={selectStyles.trigger}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={selectStyles.content} position="popper" sideOffset={8}>
                        <SelectItem value="women" className={selectStyles.item}>Women</SelectItem>
                        <SelectItem value="men" className={selectStyles.item}>Men</SelectItem>
                        <SelectItem value="unisex" className={selectStyles.item}>Unisex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-sizes">Sizes (comma separated)</Label>
                    <Input
                      id="edit-sizes"
                      name="sizes"
                      defaultValue={editingProduct.sizes.join(', ')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-colors">Colors (comma separated)</Label>
                    <Input
                      id="edit-colors"
                      name="colors"
                      defaultValue={editingProduct.colors.join(', ')}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    defaultValue={editingProduct.description}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-careInfo">Care Information</Label>
                  <Input
                    id="edit-careInfo"
                    name="careInfo"
                    defaultValue={editingProduct.careInfo}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-composition">Composition</Label>
                  <Input
                    id="edit-composition"
                    name="composition"
                    defaultValue={editingProduct.composition}
                    required
                  />
                </div>

                <Button type="submit" className="w-full tracking-[0.15em]">
                  UPDATE PRODUCT
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};
