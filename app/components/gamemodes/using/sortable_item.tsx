"use client"
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function Item(props: any) {
    const { id, itemText } = props;

    const style = {
        marging: "0 auto",
        backgroundColor: "var(--primaryColor)",
        borderRadius: "1rem",
        display: "grid",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"

    };

    return <div style={style}>{itemText}</div>;
}

export default function SortableItem(props: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({
        id: props.id,
        data: {
            choiceText: props.itemText,
            arrPos: props.arrPos
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Item id={props.id} itemText={props.itemText} />
        </div>
    );
}
