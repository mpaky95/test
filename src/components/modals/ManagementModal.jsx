import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X, Edit, Trash2, FolderTree, Ruler, MapPin, Truck, Mail, Phone, Plus, Folder, ArrowRightLeft, Building } from 'lucide-react';
import CategoryModal from './CategoryModal';
import UnitModal from './UnitModal';
import LocationModal from './LocationModal';
import SupplierModal from './SupplierModal';
import DepartmentManagementModal from './DepartmentManagementModal';
import ConfirmationModal from './ConfirmationModal';
import { useConfirmation } from '../../hooks/useConfirmation';

const ManagementModal = ({ categories, units, locations, suppliers, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('categories');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddSubcategoryModal, setShowAddSubcategoryModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editModalType, setEditModalType] = useState('');
  const { confirmationState, showConfirmation, hideConfirmation } = useConfirmation();

  const tabs = [
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'units', label: 'Units', icon: Ruler },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'departments', label: 'Departments', icon: Building },
  ];

  const handleEdit = (item, type) => {
    setEditingItem(item);
    setEditModalType(type);
    setShowEditModal(true);
  };

  const handleDelete = async (id, type, itemName) => {
    const typeLabel = type.slice(0, -1); // Remove 's' from end
    const confirmed = await showConfirmation({
      title: `Delete ${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}`,
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      icon: Trash2
    });

    if (confirmed) {
      try {
        await axios.delete(`/api/${type}/${id}`);
        toast.success(`${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} deleted successfully`);
        // Call onSuccess to refresh data but don't close the modal
        onSuccess();
      } catch (error) {
        toast.error(error.response?.data?.error || `Error deleting ${typeLabel}`);
      }
    }
  };

  const handleAddSubcategory = () => {
    setShowAddSubcategoryModal(true);
  };

  const handleManageDepartments = () => {
    setShowDepartmentModal(true);
  };

  const handleEditModalSuccess = () => {
    setShowEditModal(false);
    setEditingItem(null);
    setEditModalType('');
    // Refresh data but keep the main modal open
    onSuccess();
  };

  const handleAddSubcategorySuccess = () => {
    setShowAddSubcategoryModal(false);
    // Refresh data but keep the main modal open
    onSuccess();
  };

  const handleDepartmentModalSuccess = () => {
    setShowDepartmentModal(false);
    // Refresh data but keep the main modal open
    onSuccess();
  };

  const renderCategories = () => {
    const safeCategories = categories || [];
    const groupedCategories = safeCategories.reduce((acc, category) => {
      if (!category.parent_id) {
        if (!acc[category.id]) {
          acc[category.id] = { parent: category, children: [] };
        } else {
          acc[category.id].parent = category;
        }
      } else {
        if (!acc[category.parent_id]) {
          acc[category.parent_id] = { parent: null, children: [] };
        }
        acc[category.parent_id].children.push(category);
      }
      return acc;
    }, {});

    return (
      <div className="space-y-4">
        {/* Add Subcategory Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleAddSubcategory}
            className="btn-primary flex items-center"
          >
            <Folder className="h-4 w-4 mr-2" />
            Add Subcategory
          </button>
        </div>

        {Object.values(groupedCategories).map((group, index) => (
          <div key={index} className="border border-gray-200 rounded-lg">
            {group.parent && (
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FolderTree className="h-5 w-5 text-primary-500 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">{group.parent.name}</h3>
                      {group.parent.description && (
                        <p className="text-sm text-gray-600">{group.parent.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(group.parent, 'categories')}
                      className="text-primary-600 hover:text-primary-900"
                      title="Edit Category"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(group.parent.id, 'categories', group.parent.name)}
                      className="text-error-600 hover:text-error-900"
                      title="Delete Category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {group.children.length > 0 && (
              <div className="p-4">
                <div className="space-y-2">
                  {group.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="w-4 mr-2" />
                        <Folder className="h-4 w-4 text-gray-500 mr-2" />
                        <div>
                          <div className="font-medium text-gray-900">{child.name}</div>
                          {child.description && (
                            <div className="text-xs text-gray-600">{child.description}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(child, 'categories')}
                          className="text-primary-600 hover:text-primary-900"
                          title="Edit Subcategory"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(child.id, 'categories', child.name)}
                          className="text-error-600 hover:text-error-900"
                          title="Delete Subcategory"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {safeCategories.length === 0 && (
          <div className="text-center py-12">
            <FolderTree className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first category
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderUnits = () => {
    // Group units by type
    const safeUnits = units || [];
    const groupedUnits = safeUnits.reduce((acc, unit) => {
      const type = unit.unit_type || 'general';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(unit);
      return acc;
    }, {});

    return (
      <div className="space-y-6">
        {Object.entries(groupedUnits).map(([type, typeUnits]) => (
          <div key={type} className="border border-gray-200 rounded-lg">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-medium text-gray-900 capitalize">{type} Units</h3>
            </div>
            <div className="p-4 space-y-3">
              {typeUnits.map((unit) => (
                <div key={unit.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <Ruler className="h-5 w-5 text-primary-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">{unit.name} ({unit.abbreviation})</h4>
                      {unit.base_unit_name && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <ArrowRightLeft className="h-3 w-3 mr-1" />
                          <span>Base: {unit.base_unit_name} | Factor: {unit.conversion_factor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(unit, 'units')}
                      className="text-primary-600 hover:text-primary-900"
                      title="Edit Unit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(unit.id, 'units', `${unit.name} (${unit.abbreviation})`)}
                      className="text-error-600 hover:text-error-900"
                      title="Delete Unit"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLocations = () => (
    <div className="space-y-3">
      {(locations || []).map((location) => (
        <div key={location.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-primary-500 mr-3 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900">{location.name}</h3>
              {location.description && (
                <p className="text-sm text-gray-600">{location.description}</p>
              )}
              {location.address && (
                <p className="text-xs text-gray-500">{location.address}</p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleEdit(location, 'locations')}
              className="text-primary-600 hover:text-primary-900"
              title="Edit Location"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(location.id, 'locations', location.name)}
              className="text-error-600 hover:text-error-900"
              title="Delete Location"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSuppliers = () => (
    <div className="space-y-3">
      {(suppliers || []).map((supplier) => (
        <div key={supplier.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-start">
            <Truck className="h-5 w-5 text-primary-500 mr-3 mt-1" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{supplier.name}</h3>
              <div className="space-y-1 mt-2">
                {supplier.contact_person && (
                  <div className="text-sm text-gray-600">
                    Contact: {supplier.contact_person}
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-3 w-3 mr-1" />
                    <span>{supplier.email}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-3 w-3 mr-1" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleEdit(supplier, 'suppliers')}
              className="text-primary-600 hover:text-primary-900"
              title="Edit Supplier"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(supplier.id, 'suppliers', supplier.name)}
              className="text-error-600 hover:text-error-900"
              title="Delete Supplier"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDepartments = () => (
    <div className="text-center py-12">
      <Building className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">Department Management</h3>
      <p className="mt-1 text-sm text-gray-500 mb-4">
        Manage organizational departments for requisitions
      </p>
      <button
        onClick={handleManageDepartments}
        className="btn-primary flex items-center mx-auto"
      >
        <Building className="h-4 w-4 mr-2" />
        Manage Departments
      </button>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'categories':
        return renderCategories();
      case 'units':
        return renderUnits();
      case 'locations':
        return renderLocations();
      case 'suppliers':
        return renderSuppliers();
      case 'departments':
        return renderDepartments();
      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">Manage Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              title="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Sidebar */}
            <div className="w-64 border-r border-gray-200 bg-gray-50 flex-shrink-0">
              <nav className="p-4 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={hideConfirmation}
        onConfirm={confirmationState.onConfirm}
        title={confirmationState.title}
        message={confirmationState.message}
        confirmText={confirmationState.confirmText}
        cancelText={confirmationState.cancelText}
        type={confirmationState.type}
        icon={confirmationState.icon}
      />

      {/* Edit Modals */}
      {showEditModal && editModalType === 'categories' && (
        <CategoryModal
          categories={categories}
          item={editingItem}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditModalSuccess}
        />
      )}

      {showEditModal && editModalType === 'units' && (
        <UnitModal
          item={editingItem}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditModalSuccess}
        />
      )}

      {showEditModal && editModalType === 'locations' && (
        <LocationModal
          item={editingItem}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditModalSuccess}
        />
      )}

      {showEditModal && editModalType === 'suppliers' && (
        <SupplierModal
          item={editingItem}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditModalSuccess}
        />
      )}

      {/* Add Subcategory Modal */}
      {showAddSubcategoryModal && (
        <CategoryModal
          categories={categories}
          isSubcategory={true}
          onClose={() => setShowAddSubcategoryModal(false)}
          onSuccess={handleAddSubcategorySuccess}
        />
      )}

      {/* Department Management Modal */}
      {showDepartmentModal && (
        <DepartmentManagementModal
          onClose={() => setShowDepartmentModal(false)}
          onSuccess={handleDepartmentModalSuccess}
        />
      )}
    </>
  );
};

export default ManagementModal;