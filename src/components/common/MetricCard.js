import React from 'react';

const MetricCard = ({ title, icon: Icon, value, bgColor, textColor }) => (
    <div className={`p-4 rounded shadow-lg ${bgColor}`}>
        <h3 className={`text-lg font-medium flex items-center ${textColor}`}>
            <Icon className="mr-2" />
            {title}
        </h3>
        <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
);

export default MetricCard;
