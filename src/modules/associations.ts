import LeadsPosVenda from './leadsPosVenda.js'
import Tasks from './clickupTasks.js'
import PosVendaMessages from './posvendaMessages.js'
// Definir as associações

Tasks.belongsTo(LeadsPosVenda, { 
  foreignKey: 'leadId',
  as: 'lead'
});
  
LeadsPosVenda.hasMany(Tasks, { 
  foreignKey: 'leadId',
  as: 'tasks'
});

PosVendaMessages.belongsTo(LeadsPosVenda, { 
  foreignKey: 'leadId',
  as: 'leadposvenda'
});

LeadsPosVenda.hasMany(PosVendaMessages, { 
  foreignKey: 'leadId',
  as: 'posvendamessages'
});



// Exportar os modelos para garantir que as associações sejam aplicadas
export {
  LeadsPosVenda,
  PosVendaMessages,
};
