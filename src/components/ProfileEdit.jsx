import { useState } from "react"

export default function ProfileEdit() {
    const [username, setUsername] = useState('');
    const [bioTitle, setBioTitle] = useState('');
    const [profileBio, setProfileBio] = useState('');
    const [location, setLocation] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState(null);
    const [weight, setWeight] = useState(null);
    const [height, setHeight] = useState(null);
    const [goal, setGoal] = useState('');
    
    return (
        <>
            <div className="flex flex-row">
                <div className="w-1/3 p3">
                    <a href="" className="float-right mr-5">
                        <img src="" alt="" className="rounded-full" />
                    </a>
                </div>
                <div>
                    <h1 className="text-2xl"></h1>
                    <a href="" className="text-sm text-sky-500 font-bold">
                        Change Profile Photo
                    </a>
                </div>
            </div>
            <div className="flex flex-row mt-5 items-center">
                <div className="w-1/3 flex flex-row place-content-end align-center pr-8">
                    <label htmlFor="" className="m-0 p-0 align-baseline font-bold flex align-center">
                        Name
                    </label>
                </div>
                <div className="w-2/3 pr-10">
                <input type="text" className="border p-1 px-3 w-full" placeholder="Name" value={name}/></div>
                <p className="text-gray-400 text-xs">BLABLABLABLBA cos napiszc tutaj</p>
            </div>
        </>
    )
}