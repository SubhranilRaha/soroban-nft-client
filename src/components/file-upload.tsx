"use client";

import Image from "next/image";
import { ChangeEvent, useState } from "react";

interface FileUploadProps {
  fileData: File | null;
  setFileData: (file: File | null) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  fileData,
  setFileData,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  console.log(fileData);
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFileData(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDelete = () => {
    setFileData(null);
    setPreview(null);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {preview ? (
        <div className="relative h-64 aspect-square">
          <Image
            width={512}
            height={512}
            src={preview}
            alt="Uploaded preview"
            className="w-full h-full object-cover rounded-lg shadow-md"
          />
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      ) : (
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 aspect-square"
        >
          <div className="flex flex-col items-center justify-center p-8">
            <svg
              className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span>
            </p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
};
