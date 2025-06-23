import React from 'react';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Send, 
  ArrowRight, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Package 
} from 'lucide-react';

const RequisitionsTable = ({ 
  requisitions, 
  onEdit, 
  onView, 
  onApprove, 
  onSubmit, 
  onDelete, 
  canEdit, 
  canSubmit, 
  canApprove 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'fulfilled':
        return 'bg-purple-100 text-purple-800';
      case 'partially_fulfilled':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4" />;
      case 'submitted':
      case 'pending_approval':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'fulfilled':
      case 'partially_fulfilled':
        return <Package className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Ensure requisitions is always an array
  const safeRequisitions = Array.isArray(requisitions) ? requisitions : [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Requisition
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Requester & Department
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status & Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Items & Cost
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dates
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {safeRequisitions.map((requisition) => (
            <tr key={requisition.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">{requisition.title}</div>
                  <div className="text-sm text-gray-500">{requisition.requisition_number}</div>
                  {requisition.description && (
                    <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                      {requisition.description}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{requisition.requested_by_name}</div>
                <div className="text-sm text-gray-500">{requisition.department || 'No Department'}</div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(requisition.status)}`}>
                    {getStatusIcon(requisition.status)}
                    <span className="ml-1">{requisition.status.replace('_', ' ').toUpperCase()}</span>
                  </span>
                  <div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(requisition.priority)}`}>
                      {requisition.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {requisition.item_count} item{requisition.item_count !== 1 ? 's' : ''}
                </div>
                <div className="text-sm font-medium text-green-600">
                  ${(requisition.calculated_total_cost || 0).toLocaleString()}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  Created: {new Date(requisition.created_at).toLocaleDateString()}
                </div>
                {requisition.required_date && (
                  <div className="text-sm text-gray-500">
                    Required: {new Date(requisition.required_date).toLocaleDateString()}
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onView(requisition)}
                    className="text-blue-600 hover:text-blue-900"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  
                  {canEdit(requisition) && (
                    <button
                      onClick={() => onEdit(requisition)}
                      className="text-primary-600 hover:text-primary-900"
                      title="Edit Requisition"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  
                  {canSubmit(requisition) && (
                    <button
                      onClick={() => onSubmit(requisition.id, requisition.requisition_number)}
                      className="text-green-600 hover:text-green-900"
                      title="Submit for Approval"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  )}
                  
                  {canApprove(requisition) && (
                    <button
                      onClick={() => onApprove(requisition)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Review & Approve"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                  
                  {canEdit(requisition) && (
                    <button
                      onClick={() => onDelete(requisition.id, requisition.requisition_number)}
                      className="text-error-600 hover:text-error-900"
                      title="Delete Requisition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {safeRequisitions.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No requisitions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria or create your first requisition
          </p>
        </div>
      )}
    </div>
  );
};

export default RequisitionsTable;