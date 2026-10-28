"use client";

import { createAttendeesCsv, getAttendeesCsvFilename } from "@/lib/export/attendees-csv";
import type { Registration } from "@/lib/types";
import styles from "./attendee-csv-download.module.css";

type AttendeeCsvDownloadProps = {
  eventTitle: string;
  registrations: Registration[];
};

export function AttendeeCsvDownload({ eventTitle, registrations }: AttendeeCsvDownloadProps) {
  function downloadCsv() {
    const file = new Blob([createAttendeesCsv(registrations)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = getAttendeesCsvFilename(eventTitle);
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return <button className={styles.downloadButton} type="button" onClick={downloadCsv}>Descargar CSV</button>;
}
