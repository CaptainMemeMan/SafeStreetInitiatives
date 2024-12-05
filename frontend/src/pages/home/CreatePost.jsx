import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoCloseSharp } from "react-icons/io5";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { LoadScriptNext, GoogleMap, Marker } from "@react-google-maps/api";

const CreatePost = () => {
    const [text, setText] = useState("");
    const [img, setImg] = useState(null);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [address, setAddress] = useState("");
    const imgRef = useRef(null);

    const { data: authUser } = useQuery({ queryKey: ["authUser"] });
    const queryClient = useQueryClient();

    const apiKey = "API KEY"; // Replace with your API Key

    const {
        mutate: createPost,
        isPending,
        isError,
        error,
    } = useMutation({
        mutationFn: async ({ text, img }) => {
            try {
                const res = await fetch("/api/posts/create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ text, img, address }), // Include address in the post
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong");
                }
                return data;
            } catch (error) {
                throw new Error(error);
            }
        },
        onSuccess: () => {
            setText("");
            setImg(null);
            setAddress("");
            toast.success("Post created successfully");
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        createPost({ text, img });
    };

    const handleImgChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMapClick = async (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setSelectedPosition({ lat, lng });

        // Fetch the address using Google Maps Geocoding API
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
            );
            const data = await response.json();
            if (data.results[0]) {
                setAddress(data.results[0].formatted_address);
            } else {
                setAddress("Address not found");
            }
        } catch (error) {
            console.error("Error fetching address:", error);
        }
    };

    return (
        <div className="flex p-4 items-start gap-4 border-b border-gray-700">
            <div className="avatar">
                <div className="w-8 rounded-full">
                    <img src={authUser?.profileImg || "/avatar-placeholder.png"} />
                </div>
            </div>
            <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
                <textarea
                    className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none  border-gray-800"
                    placeholder="What is happening?!"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                {img && (
                    <div className="relative w-72 mx-auto">
                        <IoCloseSharp
                            className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
                            onClick={() => {
                                setImg(null);
                                imgRef.current.value = null;
                            }}
                        />
                        <img src={img} className="w-full mx-auto h-72 object-contain rounded" />
                    </div>
                )}

                <div className="flex justify-between border-t py-2 border-t-gray-700">
                    <div className="flex gap-1 items-center">
                        <CiImageOn
                            className="fill-primary w-6 h-6 cursor-pointer"
                            onClick={() => imgRef.current.click()}
                        />
                        <BsEmojiSmileFill
                            className="fill-primary w-5 h-5 cursor-pointer"
                            onClick={() => setIsMapOpen(true)}
                        />
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        ref={imgRef}
                        onChange={handleImgChange}
                    />
                    <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                        {isPending ? "Posting..." : "Post"}
                    </button>
                </div>
                {isError && <div className="text-red-500">{error.message}</div>}
            </form>

            {isMapOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "20px",
                            borderRadius: "10px",
                            width: "80%",
                            maxWidth: "600px",
                        }}
                    >
                        <button
                            onClick={() => setIsMapOpen(false)}
                            style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                background: "transparent",
                                border: "none",
                                fontSize: "16px",
                                cursor: "pointer",
                            }}
                        >
                            ✖
                        </button>
                        <LoadScriptNext googleMapsApiKey={apiKey}>
                            <GoogleMap
                                mapContainerStyle={{ width: "100%", height: "400px" }}
                                center={{ lat: 42.3223, lng: -83.1763 }}
                                zoom={10}
                                onClick={handleMapClick}
                            >
                                {selectedPosition && <Marker position={selectedPosition} />}
                            </GoogleMap>
                        </LoadScriptNext>
                        {address && <p>Selected Address: {address}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePost;
