//import { Alert, Box, Button, Center, CloseButton, Flex, Text } from "@mantine/core";
//import { CameraIcon } from "lucide-react";
//import { useEffect, useRef } from "react";
//import { useCamera } from "./useCamera";
//import { useCameraPermission } from "./useCameraPermission";
import YgoScanner from "./YgoScanner";

interface CardScanOverlayProps {
    onClose?: () => void;
}

export default function CardScanOverlay({ onClose }: CardScanOverlayProps) {
    return (
        <div className="card-scan-overlay">
            <YgoScanner
                onClose={onClose}
                onScanComplete={async (result) => {
                    console.log("Scan result:", result);

                    try {
                        const response = await fetch("/api/cardscan/ygo", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(result),
                        });

                        if (!response.ok) {
                            throw new Error("Failed to send scan result.");
                        }

                        const data = await response.json();
                        console.log("Backend response:", data);
                    } catch (error) {
                        console.error("POST failed, but scan still worked:", error);
                    }
                }}
            />
        </div>
    );
}


//export function CardScanOverlay({ onClose }: { onClose: () => void }) {
//	const { stream, start, stop } = useCamera()
//	const permissionState = useCameraPermission()
//	const videoRef = useRef<HTMLVideoElement | null>(null)

//	// Handle Camera Initialization
//	useEffect(() => {
//		let isMounted = true

//		const initCamera = async () => {
//			try {
//				const newStream = await start()

//				// If the component unmounted while we were waiting for the camera
//				if (!isMounted && newStream) {
//					newStream.getTracks().forEach((track) => track.stop())
//				}
//			} catch (err) {
//				if (isMounted) {
//					console.error("Failed to start camera:", err)
//				}
//			}
//		}

//		if (permissionState === "granted") {
//			initCamera()
//		}

//		return () => {
//			isMounted = false
//			stop()
//		}
//	}, [permissionState, start, stop])

//	// Handle Stream Assignment & Playback
//	useEffect(() => {
//		const video = videoRef.current
//		if (video && stream) {
//			video.srcObject = stream

//			video.play().catch((err) => {
//				console.warn("Video play interrupted:", err)
//			})
//		}

//		return () => {
//			if (video) {
//				video.srcObject = null
//			}
//		}
//	}, [stream])

//	return (
//		<Box pos="fixed" inset={0} bg="black" h="100dvh" w="100vw" style={{ overflow: "hidden" }}>
//			{permissionState !== "granted" ? (
//				<Center h="100%" p="sm">
//					<Alert color="red" w={450} title="Permission Required" icon={<CameraIcon />}>
//						<Flex direction="column" gap="md">
//							<Text size="sm" c="red">
//								{permissionState === "denied"
//									? "Camera access is disabled. Please enable it in your browser settings to scan cards."
//									: "Camera access is required to scan cards."}
//							</Text>
//							{permissionState === "prompt" && (
//								<Flex justify="flex-end">
//									<Button color="green" size="sm" mb="xs" mr="xs" onClick={() => start()}>
//										Allow Camera Access
//									</Button>
//								</Flex>
//							)}
//						</Flex>
//					</Alert>
//				</Center>
//			) : (
//				<>
//					<video
//						ref={videoRef}
//						autoPlay
//						playsInline
//						muted
//						style={{ width: "100%", height: "100%", objectFit: "cover" }}
//					/>
//					<Box
//						pos="absolute"
//						inset={0}
//						m="xl"
//						style={{
//							pointerEvents: "none",
//						}}
//					/>
//				</>
//			)}

//			<CloseButton
//				variant="transparent"
//				c="white"
//				size="xl"
//				radius="xl"
//				onClick={onClose}
//				pos="absolute"
//				top={20}
//				right={20}
//			/>
//		</Box>
//	)
//}
