export const CHENNAI_ADDRESS_POOL = [
  '101, 2nd Avenue, Anna Nagar East, Chennai - 600102',
  '14/2, 4th Cross St, Mandaveli, Chennai - 600028',
  '42/1 Besant Avenue, Adyar, Chennai - 600020',
  '88 Rajiv Gandhi Salai (OMR), Thoraipakkam, Chennai - 600097',
  '27 Panagal Park, T. Nagar, Chennai - 600017',
  '53 100 Feet Bypass Road, Velachery, Chennai - 600042',
  '18 Harrington Road, Chetpet, Chennai - 600031',
  '93 Luz Church Road, Mylapore, Chennai - 600004'
];

export const resolveOrderAddress = (order, idx = 0, customerList = []) => {
  if (!order) return CHENNAI_ADDRESS_POOL[idx % CHENNAI_ADDRESS_POOL.length];
  const direct = order.deliveryLocation || order.deliveryAddress;
  if (direct && typeof direct === 'string' && !direct.toLowerCase().includes('coimbatore') && !direct.toLowerCase().includes('rs puram')) {
    return direct.toLowerCase().includes('chennai') ? direct : `${direct}, Chennai`;
  }
  const found = (customerList || []).find(c => 
    (c.id && c.id === order?.customerId) || 
    (c.name && order?.customerName && c.name.toLowerCase() === order.customerName.toLowerCase())
  );
  if (found?.address && typeof found.address === 'string' && !found.address.toLowerCase().includes('coimbatore') && !found.address.toLowerCase().includes('rs puram')) {
    return found.address.toLowerCase().includes('chennai') ? found.address : `${found.address}, Chennai`;
  }
  return CHENNAI_ADDRESS_POOL[idx % CHENNAI_ADDRESS_POOL.length];
};

export const getAssignedCourier = (order, batches = [], agents = []) => {
  if (!order) return null;
  if (order.assignedAgent && typeof order.assignedAgent === 'string') return order.assignedAgent;
  if (order.assigned_agent) {
    const u = order.assigned_agent.profile?.username || 'Courier Agent';
    const p = order.assigned_agent.profile?.phone || '';
    return p ? `${u} (${p})` : u;
  }
  if (order.assigned_agent_id || order.assignedAgentId) {
    const agentId = order.assigned_agent_id || order.assignedAgentId;
    const found = (agents || []).find(a => a.id === agentId || a.legacy_id === agentId);
    if (found) return `${found.name || found.username || 'Agent'} (${found.phone || ''})`;
  }
  if (order.batchId) {
    const batch = (batches || []).find(b => 
      (b.id && b.id === order.batchId) || 
      (b.batchId && b.batchId === order.batchId) || 
      (b.batch_code && b.batch_code === order.batchId)
    );
    if (batch) {
      if (batch.agent?.profile?.username) {
        return `${batch.agent.profile.username} (${batch.agent.profile.phone || ''})`;
      }
      if (batch.agentName || batch.driverName) {
        return `${batch.agentName || batch.driverName} (${batch.driverPhone || ''})`;
      }
      if (batch.agentId) {
        const found = (agents || []).find(a => a.id === batch.agentId || a.legacy_id === batch.agentId);
        if (found) return `${found.name || 'Agent'} (${found.phone || ''})`;
      }
    }
  }
  return null;
};

