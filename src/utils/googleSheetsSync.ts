/**
 * Helper to sync all database tables from data.json to Google Sheets
 */
export async function syncDatabaseToGoogleSheets(db: any, accessToken: string): Promise<{ spreadsheetId: string, url: string }> {
  let spreadsheetId = db.settings?.googleSpreadsheetId;
  const spreadsheetTitle = `${db.settings?.name || 'Sistem Informasi Akademik'} - SMA Global`;

  // 1. If spreadsheetId doesn't exist, create a new Google Spreadsheet
  if (!spreadsheetId) {
    console.log("No spreadsheetId found. Creating new spreadsheet...");
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: spreadsheetTitle
        }
      })
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Gagal membuat Google Spreadsheet baru: ${errText}`);
    }

    const createData = (await createRes.json()) as any;
    spreadsheetId = createData.spreadsheetId;
    console.log(`Created new Google Spreadsheet with ID: ${spreadsheetId}`);
  }

  // 2. Fetch existing sheets/tabs from the spreadsheet
  const sheetMetaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!sheetMetaRes.ok) {
    const errText = await sheetMetaRes.text();
    throw new Error(`Gagal membaca informasi Google Spreadsheet: ${errText}`);
  }

  const sheetMetaData = (await sheetMetaRes.json()) as any;
  const existingSheetTitles = sheetMetaData.sheets?.map((s: any) => s.properties.title) || [];

  // Define target tabs we need
  const targetTabs = [
    "Ringkasan (Dashboard)",
    "Siswa",
    "Guru",
    "Kelas",
    "Mata Pelajaran",
    "Nilai Rapor",
    "Absensi Kelas",
    "Pendaftaran PPDB",
    "Pesan Hubungi Kami",
    "Log Aktivitas",
    "Tahun Ajaran"
  ];

  // 3. Create missing sheets (tabs)
  const addSheetRequests = targetTabs
    .filter(tab => !existingSheetTitles.includes(tab))
    .map(tab => ({
      addSheet: {
        properties: {
          title: tab
        }
      }
    }));

  if (addSheetRequests.length > 0) {
    console.log(`Adding ${addSheetRequests.length} missing tabs...`);
    const batchUpdateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: addSheetRequests
      })
    });

    if (!batchUpdateRes.ok) {
      const errText = await batchUpdateRes.text();
      console.error(`Failed to add sheets: ${errText}`);
    }
  }

  // 4. Prepare clear and update payloads
  // We'll clear old values first
  const clearRanges = targetTabs.map(tab => `${tab}!A1:Z5000`);
  const clearRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ranges: clearRanges
    })
  });

  if (!clearRes.ok) {
    const errText = await clearRes.text();
    console.warn(`Warning: failed to clear sheets before sync: ${errText}`);
  }

  // 5. Populate and map data for each sheet tab
  const dataPayloads: any[] = [];

  // Sheet 1: Ringkasan (Dashboard)
  const lastSyncTime = new Date().toLocaleString("id-ID", { timeZone: "Asia/Yogyakarta" }) + " WIB";
  const summaryRows = [
    ["Metrik Informasi Akademik", "Nilai Terdata / Deskripsi"],
    ["Nama Sekolah", db.settings?.name || "SMA Global"],
    ["Kepala Sekolah", db.settings?.principalName || "-"],
    ["NIP Kepala Sekolah", db.settings?.principalNip || "-"],
    ["Telepon Sekolah", db.settings?.phone || "-"],
    ["Email Sekolah", db.settings?.email || "-"],
    ["Alamat Sekolah", db.settings?.address || "-"],
    ["", ""],
    ["STATISTIK DATABASE", ""],
    ["Total Siswa Terdaftar", db.students?.length || 0],
    ["Total Guru & Staf", db.teachers?.length || 0],
    ["Total Kelas Belajar", db.classRooms?.length || 0],
    ["Total Mata Pelajaran", db.subjects?.length || 0],
    ["Total Jadwal Mengajar", db.schedules?.length || 0],
    ["Total Berita Publik", db.news?.length || 0],
    ["Total Pengumuman", db.announcements?.length || 0],
    ["Total Registrasi PPDB", db.ppdbRegistrations?.length || 0],
    ["Total Masukan Hubungi Kami", db.contactMessages?.length || 0],
    ["Total Absensi Terpindai", db.attendances?.length || 0],
    ["Total Rekap Nilai Siswa", db.grades?.length || 0],
    ["", ""],
    ["STATUS SINKRONISASI", ""],
    ["Terakhir Diperbarui", lastSyncTime],
    ["Platform Integrator", "SIAS Google Workspace Sync Tool (AI Studio)"]
  ];
  dataPayloads.push({
    range: "Ringkasan (Dashboard)!A1",
    values: summaryRows
  });

  // Sheet 2: Siswa
  const studentRows = [
    ["ID", "NIS", "NISN", "Nama Siswa", "Jenis Kelamin", "ID Kelas", "Tanggal Lahir", "Alamat", "Status", "Nama Wali", "No HP Wali", "ID User Account"]
  ];
  (db.students || []).forEach((s: any) => {
    studentRows.push([
      s.id || "",
      s.nis || "",
      s.nisn || "",
      s.name || "",
      s.gender || "",
      s.classRoomId || "",
      s.birthDate || "",
      s.address || "",
      s.status || "",
      s.parentName || "",
      s.parentPhone || "",
      s.userId || ""
    ]);
  });
  dataPayloads.push({
    range: "Siswa!A1",
    values: studentRows
  });

  // Sheet 3: Guru
  const teacherRows = [
    ["ID", "NIP", "Nama Guru", "Jenis Kelamin", "E-mail", "No Telepon", "Status", "Tanggal Lahir", "Alamat", "ID User Account"]
  ];
  (db.teachers || []).forEach((t: any) => {
    teacherRows.push([
      t.id || "",
      t.nip || "",
      t.name || "",
      t.gender || "",
      t.email || "",
      t.phone || "",
      t.status || "",
      t.birthDate || "",
      t.address || "",
      t.userId || ""
    ]);
  });
  dataPayloads.push({
    range: "Guru!A1",
    values: teacherRows
  });

  // Sheet 4: Kelas
  const classroomRows = [
    ["ID", "Nama Kelas", "Tingkat", "Jurusan", "ID Wali Kelas"]
  ];
  (db.classRooms || []).forEach((c: any) => {
    classroomRows.push([
      c.id || "",
      c.name || "",
      c.gradeLevel || "",
      c.major || "",
      c.homeroomTeacherId || ""
    ]);
  });
  dataPayloads.push({
    range: "Kelas!A1",
    values: classroomRows
  });

  // Sheet 5: Mata Pelajaran
  const subjectRows = [
    ["ID", "Kode Mata Pelajaran", "Nama Mata Pelajaran", "KKM"]
  ];
  (db.subjects || []).forEach((s: any) => {
    subjectRows.push([
      s.id || "",
      s.code || "",
      s.name || "",
      s.kkm || 0
    ]);
  });
  dataPayloads.push({
    range: "Mata Pelajaran!A1",
    values: subjectRows
  });

  // Sheet 6: Nilai Rapor
  const gradeRows = [
    ["ID", "ID Tahun Ajaran", "ID Siswa", "ID Mapel", "ID Kelas", "Nilai Tugas", "Nilai UTS", "Nilai UAS", "Nilai Akhir", "Predikat Huruf", "Catatan Guru"]
  ];
  (db.grades || []).forEach((g: any) => {
    gradeRows.push([
      g.id || "",
      g.academicYearId || "",
      g.studentId || "",
      g.subjectId || "",
      g.classRoomId || "",
      g.assignmentScore || 0,
      g.utsScore || 0,
      g.uasScore || 0,
      g.finalScore || 0,
      g.gradeLetter || "",
      g.notes || ""
    ]);
  });
  dataPayloads.push({
    range: "Nilai Rapor!A1",
    values: gradeRows
  });

  // Sheet 7: Absensi Kelas
  const attendanceRows = [
    ["ID", "ID Kelas", "Tanggal", "ID Siswa", "Status Absensi", "Catatan"]
  ];
  (db.attendances || []).forEach((a: any) => {
    attendanceRows.push([
      a.id || "",
      a.classRoomId || "",
      a.date || "",
      a.studentId || "",
      a.status || "",
      a.notes || ""
    ]);
  });
  dataPayloads.push({
    range: "Absensi Kelas!A1",
    values: attendanceRows
  });

  // Sheet 8: Pendaftaran PPDB
  const ppdbRows = [
    ["ID", "No Registrasi", "Nama Lengkap", "Jenis Kelamin", "Tempat Lahir", "Tanggal Lahir", "Alamat Tinggal", "Sekolah Asal SMP", "Nama Orang Tua/Wali", "No Telepon Wali", "E-mail Kontak", "Status Verifikasi", "Tanggal Registrasi"]
  ];
  (db.ppdbRegistrations || []).forEach((p: any) => {
    ppdbRows.push([
      p.id || "",
      p.registrationNo || "",
      p.fullName || "",
      p.gender || "",
      p.birthPlace || "",
      p.birthDate || "",
      p.address || "",
      p.prevSchool || "",
      p.parentName || "",
      p.parentPhone || "",
      p.email || "",
      p.status || "",
      p.date || ""
    ]);
  });
  dataPayloads.push({
    range: "Pendaftaran PPDB!A1",
    values: ppdbRows
  });

  // Sheet 9: Pesan Hubungi Kami
  const msgRows = [
    ["ID", "Nama Pengirim", "E-mail Kontak", "Subjek Pesan", "Isi Pesan", "Waktu Kirim", "Status Baca"]
  ];
  (db.contactMessages || []).forEach((m: any) => {
    msgRows.push([
      m.id || "",
      m.name || "",
      m.email || "",
      m.subject || "",
      m.message || "",
      m.date || "",
      m.status || ""
    ]);
  });
  dataPayloads.push({
    range: "Pesan Hubungi Kami!A1",
    values: msgRows
  });

  // Sheet 10: Log Aktivitas
  const logRows = [
    ["ID", "Username", "Peran", "Aksi Tindakan", "IP Address", "User Agent Browser", "Waktu Transaksi"]
  ];
  (db.activityLogs || []).forEach((l: any) => {
    logRows.push([
      l.id || "",
      l.username || "",
      l.role || "",
      l.action || "",
      l.ipAddress || "",
      l.userAgent || "",
      l.timestamp || ""
    ]);
  });
  dataPayloads.push({
    range: "Log Aktivitas!A1",
    values: logRows
  });

  // Sheet 11: Tahun Ajaran
  const ayRows = [
    ["ID", "Tahun Ajaran", "Semester", "Status Aktif"]
  ];
  (db.academicYears || []).forEach((ay: any) => {
    ayRows.push([
      ay.id || "",
      ay.year || "",
      ay.semester || "",
      ay.active ? "Aktif" : "Non-aktif"
    ]);
  });
  dataPayloads.push({
    range: "Tahun Ajaran!A1",
    values: ayRows
  });

  // 6. Write values to Google Sheets via batchUpdate
  console.log("Writing synchronized rows to Google Sheets...");
  const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: dataPayloads
    })
  });

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    throw new Error(`Gagal menulis data ke Google Sheet: ${errText}`);
  }

  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
  console.log(`Synchronization succeeded! URL: ${spreadsheetUrl}`);

  return {
    spreadsheetId,
    url: spreadsheetUrl
  };
}

/**
 * Fetch values for a given sheet/tab from Google Sheets
 */
async function fetchSheetValues(spreadsheetId: string, tabName: string, accessToken: string): Promise<any[][] | null> {
  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(tabName)}!A1:Z5000`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!res.ok) return null;
    const data = await res.json() as any;
    return data.values || null;
  } catch (err) {
    console.warn(`Gagal membaca lembar ${tabName} dari Google Sheets:`, err);
    return null;
  }
}

/**
 * Merges student data bidirectionally
 */
function mergeStudents(localStudents: any[], sheetRows: any[][]): any[] {
  if (!sheetRows || sheetRows.length <= 1) return localStudents;
  const mergedList = [...localStudents];

  for (let i = 1; i < sheetRows.length; i++) {
    const row = sheetRows[i];
    if (!row || row.length === 0) continue;

    let id = row[0]?.toString().trim() || "";
    const name = row[3]?.toString().trim() || "";
    if (!id && !name) continue; // Skip empty row

    if (!id) {
      id = "std_" + Math.random().toString(36).substring(2, 11);
    }

    const studentObj = {
      id,
      nis: row[1]?.toString().trim() || "",
      nisn: row[2]?.toString().trim() || "",
      name: row[3]?.toString().trim() || "",
      gender: row[4]?.toString().trim() || "Laki-laki",
      classRoomId: row[5]?.toString().trim() || "",
      birthDate: row[6]?.toString().trim() || "",
      address: row[7]?.toString().trim() || "",
      status: row[8]?.toString().trim() || "Aktif",
      parentName: row[9]?.toString().trim() || "",
      parentPhone: row[10]?.toString().trim() || "",
      userId: row[11]?.toString().trim() || ""
    };

    const existingIndex = mergedList.findIndex(s => s.id === id);
    if (existingIndex > -1) {
      mergedList[existingIndex] = { ...mergedList[existingIndex], ...studentObj };
    } else {
      mergedList.push(studentObj);
    }
  }
  return mergedList;
}

/**
 * Merges grades data bidirectionally
 */
function mergeGrades(localGrades: any[], sheetRows: any[][]): any[] {
  if (!sheetRows || sheetRows.length <= 1) return localGrades;
  const mergedList = [...localGrades];

  for (let i = 1; i < sheetRows.length; i++) {
    const row = sheetRows[i];
    if (!row || row.length === 0) continue;

    let id = row[0]?.toString().trim() || "";
    const studentId = row[2]?.toString().trim() || "";
    if (!id && !studentId) continue; // Skip empty row

    if (!id) {
      id = "grd_" + Math.random().toString(36).substring(2, 11);
    }

    const gradeObj = {
      id,
      academicYearId: row[1]?.toString().trim() || "",
      studentId: row[2]?.toString().trim() || "",
      subjectId: row[3]?.toString().trim() || "",
      classRoomId: row[4]?.toString().trim() || "",
      assignmentScore: parseFloat(row[5]?.toString().trim() || "0") || 0,
      utsScore: parseFloat(row[6]?.toString().trim() || "0") || 0,
      uasScore: parseFloat(row[7]?.toString().trim() || "0") || 0,
      finalScore: parseFloat(row[8]?.toString().trim() || "0") || 0,
      gradeLetter: row[9]?.toString().trim() || "",
      notes: row[10]?.toString().trim() || ""
    };

    const existingIndex = mergedList.findIndex(g => g.id === id);
    if (existingIndex > -1) {
      mergedList[existingIndex] = { ...mergedList[existingIndex], ...gradeObj };
    } else {
      mergedList.push(gradeObj);
    }
  }
  return mergedList;
}

/**
 * Merges attendance records bidirectionally
 */
function mergeAttendances(localAttendances: any[], sheetRows: any[][]): any[] {
  if (!sheetRows || sheetRows.length <= 1) return localAttendances;
  const mergedList = [...localAttendances];

  for (let i = 1; i < sheetRows.length; i++) {
    const row = sheetRows[i];
    if (!row || row.length === 0) continue;

    let id = row[0]?.toString().trim() || "";
    const studentId = row[3]?.toString().trim() || "";
    if (!id && !studentId) continue; // Skip empty row

    if (!id) {
      id = "att_" + Math.random().toString(36).substring(2, 11);
    }

    const attObj = {
      id,
      classRoomId: row[1]?.toString().trim() || "",
      date: row[2]?.toString().trim() || "",
      studentId: row[3]?.toString().trim() || "",
      status: row[4]?.toString().trim() || "Hadir",
      notes: row[5]?.toString().trim() || ""
    };

    const existingIndex = mergedList.findIndex(a => a.id === id);
    if (existingIndex > -1) {
      mergedList[existingIndex] = { ...mergedList[existingIndex], ...attObj };
    } else {
      mergedList.push(attObj);
    }
  }
  return mergedList;
}

/**
 * Bidirectional Sync: Fetches sheet data, merges it with local database, saves back locally,
 * and then writes the final merged state back to Google Sheets.
 */
export async function syncDatabaseBidirectional(db: any, accessToken: string): Promise<{ spreadsheetId: string, url: string }> {
  // First, make sure the spreadsheet and sheet tabs are fully initialized
  const initResult = await syncDatabaseToGoogleSheets(db, accessToken);
  const spreadsheetId = initResult.spreadsheetId;

  console.log(`Memulai sinkronisasi dua arah untuk spreadsheet: ${spreadsheetId}`);

  // Fetch Siswa, Nilai Rapor, and Absensi Kelas tabs from sheets
  const siswaRows = await fetchSheetValues(spreadsheetId, "Siswa", accessToken);
  const nilaiRows = await fetchSheetValues(spreadsheetId, "Nilai Rapor", accessToken);
  const absensiRows = await fetchSheetValues(spreadsheetId, "Absensi Kelas", accessToken);

  // Perform merges
  if (siswaRows) {
    db.students = mergeStudents(db.students || [], siswaRows);
  }
  if (nilaiRows) {
    db.grades = mergeGrades(db.grades || [], nilaiRows);
  }
  if (absensiRows) {
    db.attendances = mergeAttendances(db.attendances || [], absensiRows);
  }

  // Write final merged state back to Google Sheets (including any generated IDs or new rows)
  return await syncDatabaseToGoogleSheets(db, accessToken);
}

