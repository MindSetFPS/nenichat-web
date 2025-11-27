export default async function SendMessage(phone: string, message: string) {
    const res = await fetch("http://192.168.1.64:5100/send/message", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            phone: phone,
            message: message,
        }),
    });

    console.log(await res.json())
}