import { createContext, ReactNode, useContext, useState } from "react";

type Status = "success" | "warning" | "error";

type PopupContextType = {
    showPopup: (status: Status) => void;
};

const PopupContext = createContext<PopupContextType>({
    showPopup: () => {},
});

// ✅ map status to Tailwind classes upfront — no dynamic class generation
const statusStyles: Record<Status, string> = {
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error:   "bg-red-500",
};

export function PopupProvider({ children }: { children: ReactNode }) {
    const [visible, setVisible]   = useState(false);
    const [status, setStatus]     = useState<Status>("success");

    const showPopup = (status: Status) => {
        setStatus(status);
        setVisible(true);

        setTimeout(() => setVisible(false), 1500);
    };

    return (
        // ✅ wrap children with provider so context is accessible
        <PopupContext.Provider value={{ showPopup }}>
            {children}

            {/* ✅ popup toast */}
            <div className={`
                fixed -bottom-2 left-1/2 -translate-x-1/2 z-50
                px-4 py-2 rounded shadow-lg text-sm
                transition-all duration-300 ease-in-out
                w-12 drop-shadow-2xl
                ${statusStyles[status]}
                ${visible ? "translate-0 " : "translate-y-3 pointer-events-none"}
            `}>
            </div>
        </PopupContext.Provider>
    );
}

export function usePopup(){
    return useContext(PopupContext);
}
