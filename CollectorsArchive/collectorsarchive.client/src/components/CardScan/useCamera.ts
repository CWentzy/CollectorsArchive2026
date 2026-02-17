import { useCallback, useRef, useState } from "react"

export function useCamera() {
	const [stream, setStream] = useState<MediaStream | null>(null)
	const streamRef = useRef<MediaStream | null>(null)

	const start = useCallback(async () => {
		const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
		setStream(s)
		streamRef.current = s
		return s
	}, [])

	const stop = useCallback(() => {
		const current = streamRef.current
		current?.getTracks().forEach((track) => track.stop())
		setStream(null)
		streamRef.current = null
	}, [])

	return { stream, start, stop }
}
