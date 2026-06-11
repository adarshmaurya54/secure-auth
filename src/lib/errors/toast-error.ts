import axios from "axios";
import { toast } from "sonner";

export function showApiError(
    error: unknown,
    fallbackMessage =
        "Something went wrong"
) {
    if (axios.isAxiosError(error)) {
        const message =
            error.response?.data
                ?.message ||
            fallbackMessage;

        toast.error(message);

        return;
    }

    toast.error(
        fallbackMessage
    );
}