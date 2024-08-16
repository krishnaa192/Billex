import React, { useEffect, useState } from 'react';
import './datalist.css'; // Import a CSS file for styling

const DataList = () => {
  const [data, setData] = useState({});
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
        console.log('API Result:', result);

        const processedData = result.reduce((acc, item) => {
          const { app_serviceid, territory, servicename, operator, partner, time, pingenCount, pingenCountSuccess, pinverCount, pinverCountSuccess } = item;

          // Initialize service ID entry if not presen
          if (!acc[app_serviceid]) {
            acc[app_serviceid] = {
              info: { territory, servicename, operator, partner },
              hours: Array.from({ length: 24 }, () => ({
                pingenCount: 0,
                pingenCountSuccess: 0,
                pinverCount: 0,
                pinverCountSuccess: 0,
              })),
            };
          }

          // Update hourly data
          acc[app_serviceid].hours[parseInt(time, 10)] = {
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

  // Get the current hour
  const currentHour = new Date().getHours();

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Service ID</th>
            <th>Territory</th>
            <th>Service Name</th>
            <th>Operator</th>
            <th>Partner</th>

            {
  hours
    .filter(hour => hour < currentHour) // Filter hours less than current hour
    .map(hour => {
      const startHour = hour % 12 === 0 ? 12 : hour % 12;
      const endHour = (hour + 1) % 12 === 0 ? 12 : (hour + 1) % 12;
      const periodStart = hour < 12 ? 'am' : 'pm';
      const periodEnd = (hour + 1) < 12 || (hour + 1) === 24 ? 'am' : 'pm';

      return (
        <th key={hour}>
          {`${startHour}:00 ${periodStart}-${endHour}:00 ${periodEnd}`}
        </th>
      );
    })
}
          </tr>
        </thead>
        <tbody>
          {serviceIds.map(serviceId => {
            const { info, hours: hoursData } = data[serviceId];
            return (
              <tr key={serviceId}>

                <td>{serviceId}</td>
                <td>{info.territory}</td>
                <td>{info.servicename}</td>
                <td>{info.operator}</td>
                <td>{info.partner}</td>
                {hours
                  .filter(hour => hour < currentHour) // Filter hours less than current hour
                  .map(hour => {
                    const dataForHour = hoursData[hour] || {
                      pingenCount: 0,
                      pingenCountSuccess: 0,
                      pinverCount: 0,
                      pinverCountSuccess: 0,
                    };

                    // Check if all counts are zero
                    const allCountsZero =
                      dataForHour.pingenCount === 0 &&
                      dataForHour.pingenCountSuccess === 0 &&
                      dataForHour.pinverCount === 0 &&
                      dataForHour.pinverCountSuccess === 0;

                    return (
                      <td key={hour}>
                        {allCountsZero ? '- - - -' :
                          `${dataForHour.pingenCount || 0} ${dataForHour.pingenCountSuccess || 0} ${dataForHour.pinverCount || 0} ${dataForHour.pinverCountSuccess || 0}`}
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
