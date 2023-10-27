
export default function ShowServerErrors({ errorsSeen }: { errorsSeen: { [key: string]: string } | undefined }) {
    return (
        <div>
            {errorsSeen && errorsSeen["message"].split("|").map((eachError, eachErrorIndex) => {
                if (eachError.length === 0) return null

                return (
                    <p key={eachErrorIndex} style={{ padding: "1rem", backgroundColor: "var(--error-color)", textAlign: "center" }}>{eachError}</p>
                )
            })}
        </div>
    )
}
