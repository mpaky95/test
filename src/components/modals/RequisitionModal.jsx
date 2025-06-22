import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X, Plus, Trash2, Package, DollarSign, Calendar, AlertCircle } from 'lucide-react';

const RequisitionModal = ({ requisition, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    priority: 'medium',
    justification: '',
    required_date: '',
    workflow_id: 1
  });
  const [items, setItems] = useState([{
    inventory_id: '',
    item_name: '',
    item_description: '',
    quantity_requested: 1,
    unit_id: '',
    estimated_unit_cost: 0,
    notes: ''
  }]);
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [units, setUnits] = useState([]);
  const [workflows, setWorkflows] = useState([]);

  useEffect(() => {
    fetchDropdownData();
    
    if (requisition) {
      setFormData({
        title: requisition.title,
        description: requisition.description || '',
        department: requisition.department || '',
        priority: requisition.priority,
        justification: requisition.justification || '',
        required_date: requisition.required_date ? requisition.required_date.split('T')[0] : '',
        workflow_id: requisition.workflow_id || 1
      });
      
      // Fetch requisition items if editing
      fetchRequisitionItems();
    }
  }, [requisition]);

  const fetchDropdownData = async () => {
    try {
      const [inventoryRes, unitsRes, workflowsRes] = await Promise.all([
        axios.get('/api/inventory'),
        axios.get('/api/units'),
        axios.get('/api/workflows').catch(() => ({ data: [] })) // Graceful fallback
      ]);

      setInventory(inventoryRes.data);
      setUnits(unitsRes.data);
      
      // Use workflows from API or fallback to static ones
      if (workflowsRes.data && workflowsRes.data.length > 0) {
        setWorkflows(workflowsRes.data);
      } else {
        // Fallback to static workflows if API fails
        setWorkflows([
          { id: 1, name: 'Standard Approval' },
          { id: 2, name: 'High Value Approval' },
          { id: 3, name: 'Emergency Approval' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      // Set fallback data
      setWorkflows([
        { id: 1, name: 'Standard Approval' },
        { id: 2, name: 'High Value Approval' },
        { id: 3, name: 'Emergency Approval' }
      ]);
    }
  };

  const fetchRequisitionItems = async () => {
    if (!requisition) return;
    
    try {
      const response = await axios.get(`/api/requisitions/${requisition.id}`);
      if (response.data.items && response.data.items.length > 0) {
        setItems(response.data.items.map(item => ({
          id: item.id,
          inventory_id: item.inventory_id || '',
          item_name: item.item_name,
          item_description: item.item_description || '',
          quantity_requested: item.quantity_requested,
          unit_id: item.unit_id || '',
          estimated_unit_cost: item.estimated_unit_cost || 0,
          notes: item.notes || ''
        })));
      }
    } catch (error) {
      console.error('Error fetching requisition items:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (items.length === 0) {
      toast.error('At least one item is required');
      setLoading(false);
      return;
    }

    // Validate items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.item_name.trim()) {
        toast.error(`Item ${i + 1}: Name is required`);
        setLoading(false);
        return;
      }
      if (item.quantity_requested <= 0) {
        toast.error(`Item ${i + 1}: Quantity must be greater than 0`);
        setLoading(false);
        return;
      }
    }

    try {
      const submitData = {
        ...formData,
        items: items.map(item => ({
          ...item,
          quantity_requested: parseInt(item.quantity_requested),
          estimated_unit_cost: parseFloat(item.estimated_unit_cost) || 0
        }))
      };

      if (requisition) {
        await axios.put(`/api/requisitions/${requisition.id}`, submitData);
        toast.success('Requisition updated successfully');
      } else {
        await axios.post('/api/requisitions', submitData);
        toast.success('Requisition created successfully');
        
        // Reset form for new entries but keep modal open
        setFormData({
          title: '',
          description: '',
          department: '',
          priority: 'medium',
          justification: '',
          required_date: '',
          workflow_id: 1
        });
        setItems([{
          inventory_id: '',
          item_name: '',
          item_description: '',
          quantity_requested: 1,
          unit_id: '',
          estimated_unit_cost: 0,
          notes: ''
        }]);
      }
      
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill item details when inventory item is selected
    if (field === 'inventory_id' && value) {
      const inventoryItem = inventory.find(item => item.id == value);
      if (inventoryItem) {
        newItems[index].item_name = inventoryItem.name;
        newItems[index].item_description = inventoryItem.description || '';
        newItems[index].unit_id = inventoryItem.base_unit_id;
        newItems[index].estimated_unit_cost = inventoryItem.unit_price || 0;
      }
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      inventory_id: '',
      item_name: '',
      item_description: '',
      quantity_requested: 1,
      unit_id: '',
      estimated_unit_cost: 0,
      notes: ''
    }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotalCost = () => {
    return items.reduce((total, item) => 
      total + (item.quantity_requested * (item.estimated_unit_cost || 0)), 0
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            {requisition ? 'Edit Requisition' : 'Create New Requisition'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            title="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="form-input"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter requisition title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    className="form-input"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Enter department"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority *
                  </label>
                  <select
                    name="priority"
                    required
                    className="form-select"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Date
                  </label>
                  <input
                    type="date"
                    name="required_date"
                    className="form-input"
                    value={formData.required_date}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Approval Workflow
                  </label>
                  <select
                    name="workflow_id"
                    className="form-select"
                    value={formData.workflow_id}
                    onChange={handleChange}
                  >
                    {workflows.map(workflow => (
                      <option key={workflow.id} value={workflow.id}>
                        {workflow.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    className="form-input"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter requisition description"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Justification
                  </label>
                  <textarea
                    name="justification"
                    rows="3"
                    className="form-input"
                    value={formData.justification}
                    onChange={handleChange}
                    placeholder="Explain why this requisition is needed"
                  />
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Requested Items</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="btn-primary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">Item {index + 1}</h4>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Inventory Item
                        </label>
                        <select
                          className="form-select"
                          value={item.inventory_id}
                          onChange={(e) => handleItemChange(index, 'inventory_id', e.target.value)}
                        >
                          <option value="">Select from inventory (optional)</option>
                          {inventory.map(invItem => (
                            <option key={invItem.id} value={invItem.id}>
                              {invItem.name} ({invItem.sku})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Item Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          value={item.item_name}
                          onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                          placeholder="Enter item name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="form-input"
                          value={item.quantity_requested}
                          onChange={(e) => handleItemChange(index, 'quantity_requested', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit
                        </label>
                        <select
                          className="form-select"
                          value={item.unit_id}
                          onChange={(e) => handleItemChange(index, 'unit_id', e.target.value)}
                        >
                          <option value="">Select unit</option>
                          {units.map(unit => (
                            <option key={unit.id} value={unit.id}>
                              {unit.name} ({unit.abbreviation})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estimated Unit Cost ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-input"
                          value={item.estimated_unit_cost}
                          onChange={(e) => handleItemChange(index, 'estimated_unit_cost', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total Cost
                        </label>
                        <input
                          type="text"
                          className="form-input bg-gray-50"
                          value={`$${(item.quantity_requested * (item.estimated_unit_cost || 0)).toFixed(2)}`}
                          readOnly
                        />
                      </div>

                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          rows="2"
                          className="form-input"
                          value={item.item_description}
                          onChange={(e) => handleItemChange(index, 'item_description', e.target.value)}
                          placeholder="Enter item description"
                        />
                      </div>

                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          rows="2"
                          className="form-input"
                          value={item.notes}
                          onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                          placeholder="Additional notes for this item"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Cost Summary */}
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-lg font-medium text-green-900">Total Estimated Cost:</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    ${calculateTotalCost().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50"
            onClick={handleSubmit}
          >
            {loading ? 'Saving...' : (requisition ? 'Update Requisition' : 'Create Requisition')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequisitionModal;