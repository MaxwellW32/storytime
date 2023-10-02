"use client"
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";

import SortableItem from "./sortable_item";

const containerStyle = {


};

export default function Container(props: any) {
    const { id, items } = props;

    const { setNodeRef } = useDroppable({
        id
    });

    return (
        <SortableContext
            id={id}
            items={items}
            strategy={verticalListSortingStrategy}
        >
            <div ref={setNodeRef} style={{
                background: "#dadada",
                padding: 10,
                margin: 10,
                flex: 1,
                display: "grid",
                gridAutoFlow: id === "container4" ? "column" : "row",
                minHeight: "100px",
                minWidth: "50px",

            }}>
                {items.map((id: any) => (
                    <SortableItem key={id} id={id} />
                ))}
            </div>
        </SortableContext>
    );
}
