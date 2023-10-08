"use client"
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";

import SortableItem from "./sortable_item";
import { v4 as uuidv4 } from "uuid";



export default function Container(props: any) {
    const { id, items, arrPos, questionAsked } = props;

    const { setNodeRef } = useDroppable({ id });


    return (
        <SortableContext
            id={id}
            items={items}
            strategy={verticalListSortingStrategy}
        >
            <div ref={setNodeRef}
                style={{
                    background: "#dadada",
                    padding: 10,
                    margin: 10,
                    flex: 1,
                    display: "grid",
                    gridAutoFlow: id === "root" ? "column" : "row",
                    minHeight: "100px",
                    minWidth: "50px",

                }}>
                {questionAsked && <p>{questionAsked}</p>}
                {items.map((itemText: any) => (
                    <SortableItem key={uuidv4()} id={itemText} itemText={itemText} arrPos={arrPos} />
                ))}
            </div>
        </SortableContext>
    );
}
