import React, { useState, useEffect } from 'react';
import { Device } from '../../types';
import { saveDeviceData, getDeviceData, deleteDeviceData, logNetworkActivity } from '../../utils/networkDatabase';

interface DatabaseInterfaceProps {
  device: Device;
  onUpdate: (deviceId: string, data: any) => void;
}

const DatabaseInterface: React.FC<DatabaseInterfaceProps> = ({ device, onUpdate }) => {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [queryResult, setQueryResult] = useState<any[]>([]);
  const [newRecord, setNewRecord] = useState<string>('{}');
  const [loading, setLoading] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users LIMIT 10');

  const tables = device.data?.tables || ['users', 'sessions', 'logs'];

  useEffect(() => {
    if (selectedTable) {
      loadTableData();
    }
  }, [selectedTable]);

  const loadTableData = async () => {
    setLoading(true);
    try {
      const data = await getDeviceData(device.id, selectedTable);
      setQueryResult(data);
      await logNetworkActivity({
        sourceDevice: 'current',
        targetDevice: device.id,
        data: { action: 'query', table: selectedTable },
        type: 'command'
      });
    } catch (error) {
      console.error('Failed to load table data:', error);
    }
    setLoading(false);
  };

  const executeQuery = async () => {
    setLoading(true);
    try {
      // Simulate SQL query execution
      const mockResults = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
        id: i + 1,
        data: `Mock result ${i + 1} for query: ${sqlQuery.substring(0, 30)}...`,
        timestamp: new Date().toISOString()
      }));
      
      setQueryResult(mockResults);
      
      await logNetworkActivity({
        sourceDevice: 'current',
        targetDevice: device.id,
        data: { action: 'sql_query', query: sqlQuery, results: mockResults.length },
        type: 'command'
      });
      
      // Update device stats
      if (device.data) {
        onUpdate(device.id, {
          data: {
            ...device.data,
            queriesPerSecond: (device.data.queriesPerSecond || 0) + 1
          }
        });
      }
    } catch (error) {
      console.error('Query execution failed:', error);
    }
    setLoading(false);
  };

  const addRecord = async () => {
    if (!selectedTable) return;
    
    try {
      const recordData = JSON.parse(newRecord);
      await saveDeviceData(device.id, selectedTable, recordData);
      await loadTableData();
      setNewRecord('{}');
      
      await logNetworkActivity({
        sourceDevice: 'current',
        targetDevice: device.id,
        data: { action: 'insert', table: selectedTable, record: recordData },
        type: 'sync'
      });
    } catch (error) {
      console.error('Failed to add record:', error);
    }
  };

  const deleteRecord = async (recordId: string) => {
    try {
      await deleteDeviceData(recordId);
      await loadTableData();
      
      await logNetworkActivity({
        sourceDevice: 'current',
        targetDevice: device.id,
        data: { action: 'delete', recordId },
        type: 'command'
      });
    } catch (error) {
      console.error('Failed to delete record:', error);
    }
  };

  return (
    <div className="database-interface">
      <div className="db-header">
        <h4>DATABASE INTERFACE - {device.name}</h4>
        <div className="db-stats">
          <span>Connections: {device.data?.connections || 0}</span>
          <span>QPS: {device.data?.queriesPerSecond || 0}</span>
        </div>
      </div>

      {/* SQL Query Interface */}
      <div className="sql-section">
        <h5>SQL QUERY</h5>
        <div className="sql-input-group">
          <textarea
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="sql-input"
            placeholder="Enter SQL query..."
            rows={3}
          />
          <button
            onClick={executeQuery}
            disabled={loading}
            className="execute-btn"
          >
            {loading ? 'EXECUTING...' : 'EXECUTE'}
          </button>
        </div>
      </div>

      {/* Table Selection */}
      <div className="table-section">
        <h5>TABLES</h5>
        <div className="table-buttons">
          {tables.map((table: string) => (
            <button
              key={table}
              className={`table-btn ${selectedTable === table ? 'active' : ''}`}
              onClick={() => setSelectedTable(table)}
            >
              {table.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Data Management */}
      {selectedTable && (
        <div className="data-section">
          <h5>TABLE: {selectedTable.toUpperCase()}</h5>
          
          {/* Add New Record */}
          <div className="add-record">
            <textarea
              value={newRecord}
              onChange={(e) => setNewRecord(e.target.value)}
              className="record-input"
              placeholder='{"key": "value"}'
              rows={2}
            />
            <button onClick={addRecord} className="add-btn">
              ADD RECORD
            </button>
          </div>

          {/* Query Results */}
          <div className="results-section">
            <h6>RESULTS ({queryResult.length})</h6>
            <div className="results-table">
              {queryResult.map((record, index) => (
                <div key={record.id || index} className="result-row">
                  <div className="result-data">
                    <pre>{JSON.stringify(record, null, 2)}</pre>
                  </div>
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="delete-btn"
                  >
                    DELETE
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseInterface;
