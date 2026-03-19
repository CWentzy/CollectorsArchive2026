//import { Alert, Box, Button, Center, CloseButton, Flex, Text } from "@mantine/core";
//import { CameraIcon } from "lucide-react";
//import { useEffect, useRef } from "react";
//import { useCamera } from "./useCamera";
//import { useCameraPermission } from "./useCameraPermission";
import { useState } from "react";
import { Button, Group, SimpleGrid, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import CardItem from "../../pages/CardItem";
import YgoScanner from "./YgoScanner";

interface CardScanOverlayProps {
    onClose?: () => void;
}

type SearchOutputPrinting = {
    printID: number;
    setCode: string;
    cardRarity: string;
};

type SearchOutputCard = {
    cardID: string;
    cardName: string;
    printInfo: SearchOutputPrinting;
};

export default function CardScanOverlay({ onClose }: CardScanOverlayProps) {
    const navigate = useNavigate();
    const [results, setResults] = useState<SearchOutputCard[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleScanComplete(result: {
        passcode: string;
        setCode: string;
        name: string;
    }) {
        console.log("Scan result:", result);

        try {
            setLoading(true);
            setErrorMessage("");

            const payload = {
                cardName: result.name,
                cardID: result.passcode,
                setIndex: result.setCode,
            };

            console.log("Payload being sent:", payload);

            const response = await fetch(
                "https://collectorsarchive.azurewebsites.net/api/CardSearch/CVSearch",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to send scan result.");
            }

            const data: SearchOutputCard[] = await response.json();
            console.log("Backend response:", data);

            setResults(data);
        } catch (error) {
            console.error("POST failed, but scan still worked:", error);
            setErrorMessage("Could not load card matches.");
        } finally {
            setLoading(false);
        }
    }

    function handleRescan() {
        setResults(null);
        setErrorMessage("");
    }

    return (
        <div className="card-scan-overlay">
            {!results && (
                <YgoScanner
                    onClose={onClose}
                    onScanComplete={handleScanComplete}
                />
            )}

            {loading && (
                <div style={{ padding: 24 }}>
                    <Text>Searching for matching cards...</Text>
                </div>
            )}

            {!loading && results && (
                <div style={{ padding: 24 }}>
                    <Group justify="space-between" mb="md">
                        <Text fw={700} size="lg">
                            Scan Results
                        </Text>

                        <Group>
                            <Button variant="default" onClick={handleRescan}>
                                Rescan
                            </Button>
                            <Button variant="light" onClick={onClose}>
                                Close
                            </Button>
                        </Group>
                    </Group>

                    {results.length === 0 && (
                        <Text>No matches found.</Text>
                    )}

                    {results.length > 0 && (
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                            {results.map((card) => (
                                <CardItem
                                    key={`${card.cardID}-${card.printInfo.setCode}`}
                                    id={card.cardID}
                                    name={card.cardName}
                                    navigate={navigate}
                                />
                            ))}
                        </SimpleGrid>
                    )}
                </div>
            )}

            {!loading && errorMessage && !results && (
                <div style={{ padding: 24 }}>
                    <Text c="red">{errorMessage}</Text>
                </div>
            )}
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
