import { ActionIcon, Group, Text } from "@mantine/core"
import { IconMinus, IconPlus } from "@tabler/icons-react"
import { useState } from "react"

const ADD_TO_COLLECTION_URL = "https://collectorsarchive.azurewebsites.net/api/UserCard/AddToCollection"

interface QuantityPickerProps {
    printID?: string
    onChange?: (quantity: number) => void
}
export default function QuantityPicker({ printID, onChange }: QuantityPickerProps) {
    const [quantity, setQuantity] = useState(0)
    const user = JSON.parse(localStorage.getItem("user") || "null")

    const increment = async () => {
        const next = quantity + 1
        setQuantity(next)
        onChange?.(next)

        if (!printID || !user?.userId) return
        await fetch(ADD_TO_COLLECTION_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user?.userId,
                printID: printID,
                quantity: 1
            })
        })
    }

    const decrement = () => {
        const next = Math.max(0, quantity - 1)
        setQuantity(next)
        onChange?.(next)
    }

    return (
        <Group gap="xs" align="center">
            <ActionIcon variant="light" color="red" size="sm" onClick={decrement} disabled={quantity === 0}>
                <IconMinus size={12} />
            </ActionIcon>
            <Text fw={600} size="sm" w={20} ta="center">{quantity}</Text>
            <ActionIcon variant="light" color="spell-green" size="sm" onClick={increment}>
                <IconPlus size={12} />
            </ActionIcon>
        </Group>
    )
}