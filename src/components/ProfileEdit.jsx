import { useState, useEffect } from "react"
import { getEditData, updateUserData } from "../services/userProfileService";
import ImageUploadModal from "./ImageUploadModal";
import { useUser } from '../context/UserContext'; 
//import { useNavigate } from 'react-router-dom';

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

    const { profilePictureUrl: globalProfilePictureUrl, updateProfilePicture } = useUser();

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
            
            // 3. Po sukcesie - możesz coś zrobić
            alert("Profile updated successfully!");
            // navigate('/profile'); // np. przekieruj na stronę profilu
        } catch (err) {
            setError(err.message || "An error occurred during update.");
        } finally {
            setIsSubmitting(false); // Odblokuj przycisk
        }
    };

    const handleUploadSuccess = (newImageUrl) => {
         updateProfilePicture(newImageUrl);
    };
    
    if (loading) return <p>Loading profile...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-row">
                <div className="w-1/3 p-3">
                    <div className="float-right mr-5">
                        <img 
                            src={globalProfilePictureUrl} 
                            alt="Profile thumbnail" 
                            onClick={() => setIsModalOpen(true)}
                            className="w-10 h-10 rounded-full object-cover cursor-pointer" 
                        />
                    </div>
                </div>
                <div>
                    <h1 className="text-2xl">{username}</h1>
                    <button 
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="text-sm text-sky-500 font-bold hover:underline"
                    >
                        Change Profile Photo
                    </button>
                </div>
            </div>
            <div className="flex flex-row mt-5 items-center">
                <div className="w-1/3 flex flex-row place-content-end align-center pr-8">
                    <label htmlFor="" className="m-0 p-0 align-baseline font-bold flex align-center">
                        Username
                    </label>
                </div>
                <div className="w-2/3 pr-10">
                <input 
                    type="text" 
                    className="border p-1 px-3 w-full" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}/></div>
            </div>

            <div className="flex flex-row mt-5 items-center">
                <div className="w-1/3 flex flex-row place-content-end align-center pr-8">
                    <label htmlFor="" className="m-0 p-0 align-baseline font-bold flex align-center">
                        Bio Title
                    </label>
                </div>
                <div className="w-2/3 pr-10">
                <input 
                    type="text" 
                    className="border p-1 px-3 w-full" 
                    placeholder="Bio Title" 
                    value={bioTitle} 
                    onChange={(e) => setBioTitle(e.target.value)}/></div>
            </div>

            <div className="flex flex-row mt-5 items-center">
                <div className="w-1/3 flex flex-row place-content-end align-center pr-8">
                    <label htmlFor="" className="m-0 p-0 align-baseline font-bold flex align-center">
                        Profile Bio
                    </label>
                </div>
                <div className="w-2/3 pr-10">
                <textarea
                    className="border p-1 px-3 w-full"
                    rows="5"
                    value={profileBio} 
                    onChange={(e) => setProfileBio(e.target.value)}/></div>
            </div>

            <div className="flex flex-row mt-5 items-center">
                <div className="w-1/3 flex flex-row place-content-end align-center pr-8">
                    <label htmlFor="" className="m-0 p-0 align-baseline font-bold flex align-center">
                        Location
                    </label>
                </div>
                <div className="w-2/3 pr-10">
                <input 
                    type="text" 
                    className="border p-1 px-3 w-full" 
                    placeholder="Location" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)}/></div>
            </div>

            <div className="flex flex-row mt-5 items-center">
                <div className="w-1/3 flex flex-row place-content-end align-center pr-8">
                    <label htmlFor="" className="m-0 p-0 align-baseline font-bold flex align-center">
                        Gender
                    </label>
                </div>
                 <div className="w-2/3 pr-10">
                    <select 
                        id="gender"
                        className="border p-1 px-3 w-full" 
                        value={gender} 
                        onChange={(e) => setGender(e.target.value)}>
                        <option value="">Select Gender</option>
                        <option value="FEMALE">FEMALE</option>
                        <option value="MALE">MALE</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-row mt-5 items-center">
                <div className="w-1/3 flex flex-row place-content-end align-center pr-8">
                    <label htmlFor="" className="m-0 p-0 align-baseline font-bold flex align-center">
                        Date of Birth
                    </label>
                </div>
                <div className="w-2/3 pr-10">
                    <input 
                        type="date" 
                        id="dateOfBirth"
                        className="border p-1 px-3 w-full" 
                        value={dateOfBirth} 
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                    />
                </div>
            </div>

            <div className="flex flex-row mt-5 items-center">
                <div className="w-1/3 flex flex-row place-content-end align-center pr-8">
                    <label htmlFor="" className="m-0 p-0 align-baseline font-bold flex align-center">
                        Weight
                    </label>
                </div>
                <div className="w-2/3 pr-10">
                <input 
                    type="number" 
                    step="0.01"
                    id="weight"
                    className="border p-1 px-3 w-full" 
                    placeholder="Weight (kg)" 
                    value={weight} 
                    onChange={(e) => setWeight(e.target.value)}
                    min="0"
                />
                </div>
            </div>

            <div className="flex flex-row mt-5 items-center">
                <div className="w-1/3 flex flex-row place-content-end align-center pr-8">
                    <label htmlFor="" className="m-0 p-0 align-baseline font-bold flex align-center">
                        Height
                    </label>
                </div>
                <div className="w-2/3 pr-10">
                <input 
                    type="number" 
                    step="0.01"
                    id="height"
                    className="border p-1 px-3 w-full" 
                    placeholder="Height (cm)" 
                    value={height} 
                    onChange={(e) => setHeight(e.target.value)}
                    min="0"
                />
                </div>
            </div>

            <div className="flex flex-row mt-5 items-center">
                <div className="w-1/3 flex flex-row place-content-end align-center pr-8">
                    <label htmlFor="" className="m-0 p-0 align-baseline font-bold flex align-center">
                        Goal
                    </label>
                </div>
                <div className="w-2/3 pr-10">
                    <select 
                        id="goal"
                        className="border p-1 px-3 w-full" 
                        value={goal} 
                        onChange={(e) => setGoal(e.target.value)}>
                        <option value="">Select Goal</option>
                        <option value="reduction">reduction</option>
                        <option value="bulk">bulk</option>
                        <option value="maintenance">maintenance</option>
                    </select>
                </div>
            </div>
            <div className="flex flex-row mt-5 items-center">
                <div className="w-1/3 flex flex-row place-content-end align-center pr-8">
                </div>
                <div className="w-2/3 pr-10">
                    <button className="bg-sky-500 text-white font-semibold py-1 px-2 rounded text-sm disabled:opacity-50 cursor-pointer hover:bg-sky-700 transition-colors duration-200" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>
            <ImageUploadModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />
        </form>
    )
}