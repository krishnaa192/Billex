import React, { useEffect, useState } from 'react';
import './datalist.css'; // Import a CSS file for styling

const DataList = () => {
  const [data, setData] = useState([]);
  const [serviceIds, setServiceIds] = useState([]);
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://wap.matrixads.in/mglobopay/getSupportMonitorData', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('API Result:', result); // Log the result to check its structure

        // Process and structure the data
        const processedData = result.reduce((acc, item) => {
          const { app_serviceid, time, pingenCount, pingenCountSuccess, pinverCount, pinverCountSuccess } = item;
          if (!acc[app_serviceid]) {
            acc[app_serviceid] = Array.from({ length: 24 }, () => ({
              pingenCount: 0,
              pingenCountSuccess: 0,
              pinverCount: 0,
              pinverCountSuccess: 0,
            }));
          }
          acc[app_serviceid][parseInt(time, 10)] = {
            pingenCount: pingenCount || 0,
            pingenCountSuccess: pingenCountSuccess || 0,
            pinverCount: pinverCount || 0,
            pinverCountSuccess: pinverCountSuccess || 0,
          };
          return acc;
        }, {});

        // Extract service IDs and hours
        const ids = Object.keys(processedData);
        const hoursArray = Array.from({ length: 24 }, (_, hour) => hour);

        setData(processedData);
        setServiceIds(ids);
        setHours(hoursArray);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Data List</h1>
      <table>
        <thead>
          <tr>
            <th>Service ID</th>
            {hours.map(hour => (
              <th key={hour}>{`${hour}:00-${hour + 1}:00`}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {serviceIds.map(serviceId => {
            const dataForService = data[serviceId] || [];
            return (
              <tr key={serviceId}>
                <td>{`Service ID: ${serviceId}`}</td>
                {hours.map(hour => {
                  const dataForHour = dataForService[hour] || {
                    pingenCount: 0,
                    pingenCountSuccess: 0,
                    pinverCount: 0,
                    pinverCountSuccess: 0,
                  };
                  return (
                    <td key={hour}>
                      {`${dataForHour.pingenCount || ''} pg ${dataForHour.pingenCountSuccess || ''} pgs ${dataForHour.pinverCount || ''} pv ${dataForHour.pinverCountSuccess || ''} pvs`}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DataList;
