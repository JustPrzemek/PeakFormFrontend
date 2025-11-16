import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import EmailConfirmedPage from './pages/EmailConfirmedPage';
import MainLayout from "./pages/MainLayout";
import Profile from './pages/ProfilePage';
import ProfileEdit from './components/userprofile/ProfileEdit';
import SettingsPage from './pages/SettingsPage';
import ProtectedLayout from './layouts/ProtectedLayout';
import { Toaster } from 'react-hot-toast';
import TrainingPage from './pages/TrainingPage';
import ExercisesListPage from './pages/ExercisesListPage';
import ExerciseDetailPage from './pages/ExerciseDetailPage';
import TrainingPlansPage from './pages/TrainingPlansPage';
import TrainingPlanDetailPage from './pages/TrainingPlanDetailPage';
import SelectTrainingDay from './pages/SelectTrainingDay';
import LiveTraining from './pages/LiveTraining';
import TrainingHomePage from './pages/TrainingHomePage';
import LogPastWorkoutPage from './pages/LogPastWorkoutPage';
import WorkoutHistoryPage from './pages/WorkoutHistoryPage';
import SessionDetailPage from './pages/SessionDetailPage';
import StatisticsPage from './pages/StatisticsPage';
import PeakFormPage from './pages/PeakFormPage'
import NutritionDashboardPage from './pages/NutritionDashboardPage';
import NutritionStatsPage from './pages/NutritionStatsPage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

function App() {
    return (
        <Router>
            <Toaster position="top-center" reverseOrder={false} />
            <Routes>
                <Route path="/login" element={<AuthPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/auth/callback" element={<OAuth2RedirectHandler />} />
                <Route path="/email-confirmed" element={<EmailConfirmedPage />} />
                <Route path="/peakform" element={<PeakFormPage/>} />
                
                {/* Publiczne strony - dostępne bez logowania */}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route element={<ProtectedLayout />}>
                    <Route
                        path="/home"
                        element={
                            <MainLayout>
                                <HomePage />
                            </MainLayout>
                        }
                    />

                    <Route path="/profile/edit"
                        element={
                            <MainLayout>
                                <SettingsPage/>
                            </MainLayout>
                            
                        }
                    >
                        <Route index element={<Navigate to="edit" replace/>}/>
                        <Route path='edit' element={<ProfileEdit/>}/>
                    </Route >
                    
                    <Route path="/profile/:username"
                        element={
                            <MainLayout>
                                <Profile />
                            </MainLayout>
                        }
                    />

                    <Route 
                        path="/training" 
                        element={
                            <MainLayout>
                                <TrainingPage />
                            </MainLayout>
                        } 
                    />
                    <Route 
                        path="/training/exercises" 
                        element={
                            <MainLayout>
                                <ExercisesListPage />
                            </MainLayout>
                        } 
                    />
                    <Route 
                        path="/training/exercises/:id" 
                        element={
                            <MainLayout>
                                <ExerciseDetailPage />
                            </MainLayout>
                        } 
                    />
                    
                    <Route 
                        path="/training/plans" 
                        element={
                            <MainLayout>
                                <TrainingPlansPage />
                            </MainLayout>
                        } 
                    />
                    <Route 
                        path="/training/plans/:planId" 
                        element={
                            <MainLayout>
                                <TrainingPlanDetailPage />
                            </MainLayout>
                        } 
                    />

                    <Route 
                        path="/training/start" 
                        element={
                            <MainLayout>
                               <TrainingHomePage />
                            </MainLayout>
                    } 
                    />

                    <Route 
                        path="/training/live/:day" 
                        element={
                            <MainLayout>
                                <LiveTraining />
                            </MainLayout>
                        } 
                    />

                    <Route 
                        path="/training/history" 
                        element={
                            <MainLayout>
                                <WorkoutHistoryPage />
                            </MainLayout>
                        } 
                    />
                    <Route 
                        path="/training/history/:sessionId" 
                        element={
                            <MainLayout>
                                <SessionDetailPage />
                            </MainLayout>
                        } 
                    />

                    <Route 
                        path="/training/complete" 
                        element={
                        <MainLayout>
                            <LogPastWorkoutPage/>
                        </MainLayout>
                    } />

                    <Route 
                        path="/training/statistic" 
                        element={
                        <MainLayout>
                            <StatisticsPage/>
                        </MainLayout>
                    } />

                    <Route 
                        path="/nutrition" 
                        element={
                        <MainLayout>
                            <NutritionDashboardPage />
                        </MainLayout>
                    } />

                    <Route 
                        path="/nutrition/stats" 
                        element={
                        <MainLayout>
                            <NutritionStatsPage />
                        </MainLayout>
                    } />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;