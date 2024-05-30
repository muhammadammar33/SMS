/* eslint-disable prettier/prettier */
import React, { createContext, useState } from 'react';

export const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
    const [selectedStudent, setSelectedStudent] = useState(null);

    return (
        <StudentContext.Provider value={{ selectedStudent, setSelectedStudent }}>
            {children}
        </StudentContext.Provider>
    );
};
