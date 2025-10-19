import { useState, useEffect } from "react"
import { getEditData, updateUserData } from "../services/userProfileService";
import ImageUploadModal from "./ImageUploadModal";
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';
import ProfileEditSkeleton from "../components/skeletons/ProfileEditSkeleton";
import {CgSpinner} from "react-icons/cg";
//import { useNavigate } from 'react-router-dom';

const FormField = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-borderGrayHover mb-2">{label}</label>
        {children}
    </div>
);

export default function ProfileEdit() {
     const [username, setUsername] = useState('');
    const [bioTitle, setBioTitle] = useState('');
    const [profileBio, setProfileBio] = useState('');
    const [location, setLocation] = useState('');
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [goal, setGoal] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user, updateProfilePicture } = useUser();

    //const navigate = useNavigate();

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const profileData = await getEditData();
                
                setUsername(profileData.username || '');
                setBioTitle(profileData.bioTitle || '');
                setProfileBio(profileData.profileBio || '');
                setLocation(profileData.location || '');
                setGender(profileData.gender || '');
                setDateOfBirth(profileData.dateOfBirth || '');
                setWeight(profileData.weight || '');
                setHeight(profileData.height || '');
                setGoal(profileData.goal || '');

            } catch (err) {
                setError(err.message || "Wystąpił błąd podczas ładowania danych.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);
    
    const handleSubmit = async (event) => {
        event.preventDefault(); // Zapobiegaj domyślnemu przeładowaniu strony
        setIsSubmitting(true);
        setError(null); // Zresetuj błędy

        // 1. Zbieramy dane ze stanów do jednego obiektu
       const updatedData = {
            username,
            bioTitle,
            profileBio,
            location,
            gender: gender || null, // Jeśli gender jest pustym stringiem, wyślij null
            dateOfBirth: dateOfBirth || null, // Jeśli data jest pusta, wyślij null
            
            // KLUCZOWA ZMIANA: Konwertuj na liczbę lub wyślij null
            weight: weight ? parseFloat(weight) : null,
            height: height ? parseFloat(height) : null,
            
            goal: goal || null // Jeśli goal jest pustym stringiem, wyślij null
        };

        try {
            // 2. Wysyłamy obiekt do backendu
            await updateUserData(updatedData);
            toast.success('Profile updated successfully!');
        } catch (err) {
            const errorMessage = err.message || "An error occurred during update.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false); // Odblokuj przycisk
        }
    };

    const handleUploadSuccess = (newImageUrl) => {
        updateProfilePicture(newImageUrl);
        toast.success('Profile picture updated!');
    };
    
    if (loading) return <ProfileEditSkeleton />;
    if (error) return <p className="text-red-500 text-center mt-10">Error: {error}</p>;

    return (
        <div className="bg-backgoudBlack text-whitePrimary min-h-screen pb-24"> {/* Dodany padding na dole dla belki */}
            <form onSubmit={handleSubmit}>
                <div className="container max-w-3xl mx-auto py-12 px-4">
                    <h1 className="text-3xl font-bold mb-10">Edit Profile</h1>

                    {/* Zmiana zdjęcia */}
                    <div className="flex items-center gap-5 mb-10">
                        <img 
                            src={user?.profileImageUrl} 
                            alt="Profile thumbnail" 
                            className="w-16 h-16 rounded-full object-cover" 
                        />
                        <div>
                            <p className="font-bold text-lg">{user?.username}</p>
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="text-sm text-bluePrimary font-bold hover:underline"
                            >
                                Change profile photo
                            </button>
                        </div>
                    </div>

                    {/* --- SEKCJA 1: INFORMACJE PUBLICZNE --- */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-semibold border-b border-borderGrayHover pb-2">Public Information</h2>
                        <FormField label="Username">
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                        </FormField>
                        <FormField label="Bio Title">
                            <input type="text" placeholder="e.g. Fitness Enthusiast | Lifter" value={bioTitle} onChange={(e) => setBioTitle(e.target.value)} />
                        </FormField>
                        <FormField label="Profile Bio">
                            <textarea rows="4" placeholder="Tell everyone a little about yourself" value={profileBio} onChange={(e) => setProfileBio(e.target.value)} />
                        </FormField>
                    </section>

                    {/* --- SEKCJA 2: DANE FITNESS --- */}
                    <section className="mt-10 space-y-6">
                        <h2 className="text-xl font-semibold border-b border-borderGrayHover pb-2">Fitness & Personal Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Weight (kg)">
                                <input type="number" step="0.1" placeholder="e.g. 85.5" value={weight} onChange={(e) => setWeight(e.target.value)} />
                            </FormField>
                            <FormField label="Height (cm)">
                                <input type="number" placeholder="e.g. 180" value={height} onChange={(e) => setHeight(e.target.value)} />
                            </FormField>
                            <FormField label="Primary Goal">
                                <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                                    <option value="">Select Goal</option>
                                    <option value="reduction">Reduction</option>
                                    <option value="bulk">Bulk</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </FormField>
                             <FormField label="Location">
                                <input type="text" placeholder="e.g. New York, USA" value={location} onChange={(e) => setLocation(e.target.value)}/>
                            </FormField>
                            <FormField label="Gender">
                                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                                    <option value="">Select Gender</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="MALE">Male</option>
                                </select>
                            </FormField>
                            <FormField label="Date of Birth">
                                <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} max={new Date().toISOString().split('T')[0]} />
                            </FormField>
                        </div>
                    </section>
                </div>
                
                {/* --- NOWA, PŁYWAJĄCA BELKA ZAPISU --- */}
                <footer className="fixed bottom-0 left-0 right-0 bg-surfaceDarkGray border-t border-borderGrayHover z-10">
                    <div className="container max-w-3xl mx-auto p-4 flex justify-end items-center">
                        {error && <p className="text-red-400 text-sm mr-4">{error}</p>}
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="bg-bluePrimary text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors hover:bg-blueHover"
                        >
                            {isSubmitting ? <CgSpinner className="animate-spin"/> : null}
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </footer>
            </form>
            <ImageUploadModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />
        </div>
    );
}