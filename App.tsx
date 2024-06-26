/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import Welcome from './src/screens/Welcome';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from './src/screens/SignIn';
import AdminDashboard from './src/screens/admin/dashboard';
import AssignRemoveClass from './src/screens/admin/arClasstoTeacher';
import StudentManagement from './src/screens/admin/studentManagement';
import FeeStatusManagement from './src/screens/admin/feeStatusManagement';
import ViewReports from './src/screens/admin/viewReports';
import StudentDashboard from './src/screens/Student/dashboard';
import TeacherDashboard from './src/screens/Teacher/dashboard';
import SelectStudent from './src/screens/Teacher/selectStudent';
import UploadRemoveTimetable from './src/screens/admin/timetable';
import UploadRemoveSyllabus from './src/screens/admin/syllabus';

const stack = createNativeStackNavigator();

const App = () => {
  return (
    <PaperProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <stack.Navigator>
            <stack.Screen name="Welcome" component={Welcome} options={{headerShown: false}}/>
            <stack.Screen name="SignIn" component={SignInScreen} options={{headerShown: false}}/>
            <stack.Screen name="AdminDashboard" component={AdminDashboard} options={{headerShown: false}}/>
            <stack.Screen name="AssignRemoveClass" component={AssignRemoveClass} options={{headerShown: false}}/>
            <stack.Screen name="StudentManagement" component={StudentManagement} options={{headerShown: false}}/>
            <stack.Screen name="FeeStatusManagement" component={FeeStatusManagement} options={{headerShown: false}}/>
            <stack.Screen name="ViewReports" component={ViewReports} options={{headerShown: false}}/>
            <stack.Screen name="StudentDashboard" component={StudentDashboard} options={{headerShown: false}}/>
            <stack.Screen name="TeacherDashboard" component={TeacherDashboard} options={{headerShown: false}}/>
            <stack.Screen name="SelectStudent" component={SelectStudent} options={{headerShown: false}}/>
            <stack.Screen name="UploadRemoveTimetable" component={UploadRemoveTimetable} options={{headerShown: false}}/>
            <stack.Screen name="UploadRemoveSyllabus" component={UploadRemoveSyllabus} options={{headerShown: false}}/>
          </stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </PaperProvider>
  );
};

export default App;
