import PhoneField from "@/components/form/phone-field"
import UncontrolledInput from "@/components/form/uncontrolled-input"
import { Button } from "@/components/ui/button"
import { useRequest } from "@/hooks/react-query/use-request"
import { API } from "@/lib/constants/api-endpoints"
import { CookieService } from "@/lib/utils/cookie-service"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import FormTitle from "../../-components/form-title"

type Form = {
    phone_number: string
    password: string
}
interface Response {
    access: string
    refresh: string
}

export default function Login() {
    const { error, post, isError, isPending } = useRequest()
    const methods = useForm<Form>({
        disabled: isPending,
        defaultValues: {
            phone_number: "",
            password: "",
        },
    })

    const onSubmit = methods.handleSubmit((vals) => {
        post(API.AUTH.LOGIN.INDEX, vals, {
            onSuccess: (data: Response) => {
                const access = data?.access
                const refresh = data?.refresh
                if (access) {
                    CookieService.setAccessToken(access)
                    // setAccessToken(access)
                    toast.success("Successfully!")
                }
                if (refresh) {
                    CookieService.setRefreshToken(refresh)
                    // setRefreshToken(refresh)
                }
                location.replace("/")
            },
        })
    })

    return (
        <form
            className="flex flex-col gap-4"
            autoComplete="on"
            onSubmit={onSubmit}
            noValidate
        >
            <FormTitle text="Sign in" />
            <PhoneField
                methods={methods}
                name="phone_number"
                label={"Phone number"}
                disableValidation
            />
            <UncontrolledInput
                methods={methods}
                name="password"
                type="password"
                label={"Password"}
                autoComplete="on"
            />

            <Button type="submit" isLoading={isPending}>
                Log in
            </Button>

            {isError && (
                <p className="text-destructive text-center">
                    {error?.response?.data?.error?.[0]}
                </p>
            )}
        </form>
    )
}
