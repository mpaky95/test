import React from 'react';
import { 
  Edit, 
  Trash2, 
  DollarSign, 
  TrendingUp, 
  History, 
  AlertTriangle, 
  ArrowRightLeft,
  SortAsc,
  SortDesc,
  Package
} from 'lucide-react';

const InventoryTable = ({ 
  items, 
  sortField, 
  sortDirection, 
  onSort, 
  onEdit, 
  onDelete, 
  onViewPurchaseHistory 
}) => {
  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />;
  };

  const getStockStatusColor = (item) => {
    if (item.quantity === 0) return 'text-red-600';
    if (item.quantity <= item.min_quantity) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStockStatusIcon = (item) => {
    if (item.quantity === 0) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (item.quantity <= item.min_quantity) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return null;
  };

  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('name')}
            >
              <div className="flex items-center">
                Item Details
                {getSortIcon('name')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('category_name')}
            >
              <div className="flex items-center">
                Category & Location
                {getSortIcon('category_name')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('quantity')}
            >
              <div className="flex items-center">
                Units & Stock
                {getSortIcon('quantity')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('unit_price')}
            >
              <div className="flex items-center">
                Pricing
                {getSortIcon('unit_price')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {safeItems.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                  {item.description && (
                    <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{item.category_name || 'No Category'}</div>
                <div className="text-sm text-gray-500">{item.location_name || 'No Location'}</div>
                <div className="text-xs text-gray-400">{item.supplier_name || 'No Supplier'}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <span className={`text-sm font-medium ${getStockStatusColor(item)}`}>
                    {item.quantity} {item.base_unit_abbr || 'units'}
                  </span>
                  {getStockStatusIcon(item)}
                </div>
                <div className="text-xs text-gray-500">
                  Min: {item.min_quantity} | Max: {item.max_quantity}
                </div>
                {item.issue_unit_abbr && item.issue_unit_abbr !== item.base_unit_abbr && (
                  <div className="flex items-center text-xs text-blue-600 mt-1">
                    <ArrowRightLeft className="h-3 w-3 mr-1" />
                    Issue: {item.issue_unit_abbr}
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-3 w-3 text-gray-400 mr-1" />
                    <span className="font-medium text-gray-900">${item.unit_price}</span>
                    <span className="text-xs text-gray-500 ml-1">Current</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="h-3 w-3 text-blue-500 mr-1" />
                    <span className="text-blue-600">${item.last_purchase_price || 0}</span>
                    <span className="text-xs text-gray-500 ml-1">Last Purchase</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <History className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-600">${item.average_price || 0}</span>
                    <span className="text-xs text-gray-500 ml-1">Average</span>
                  </div>
                  <div className="text-xs text-gray-500 border-t pt-1">
                    Total: ${item.total_value}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewPurchaseHistory(item.id)}
                    className="text-blue-600 hover:text-blue-900"
                    title="View Purchase History"
                  >
                    <History className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit(item)}
                    className="text-primary-600 hover:text-primary-900"
                    title="Edit Item"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id, item.name)}
                    className="text-error-600 hover:text-error-900"
                    title="Delete Item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {safeItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria or add your first item
          </p>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;