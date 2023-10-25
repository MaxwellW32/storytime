"use client"
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";

import SortableItem from "./sortable_item";



export default function Container(props: any) {
    const { id, items, arrPos, questionAsked } = props;

    const { setNodeRef } = useDroppable({ id });

    const normalStyle = {
        backgroundColor: "var(--backgoundColor)",
        border: "2px solid var(--textColor)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "1rem",
        gap: "1rem",
        minHeight: "150px",
        margin: ".5rem"
    }

    const rootStyle = {
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        border: "2px solid var(--textColor)",
        justifyContent: "center",
        padding: "1rem",
        margin: "1rem",
    }

    const usingStyle = id === "root" ? rootStyle : normalStyle

    return (
        <>
            {items ? (<SortableContext
                id={id}
                items={items}
                strategy={verticalListSortingStrategy}
            >
                <div ref={setNodeRef} style={usingStyle as React.CSSProperties}>
                    {questionAsked && <p style={{ whiteSpace: "pre-wrap" }}>{questionAsked}</p>}


                    {items.map((itemText: any) => (
                        <SortableItem key={itemText} id={itemText} itemText={itemText} arrPos={arrPos} />
                    ))}

                </div>
            </SortableContext>) : (
                null
            )}

        </>
    );
}