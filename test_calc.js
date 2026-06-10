const KANDIDAT = {
  "pengalaman_kerja": [
    {
      "end": "now",
      "start": "August 2023"
    },
    {
      "end": "January 2026",
      "start": "September 2025"
    },
    {
      "end": "June 2025",
      "start": "February 2025"
    }
  ]
};

function calculateTotalExperience(pengalaman) {
  if (!pengalaman || !Array.isArray(pengalaman)) return 0

  const parseDate = (dateStr) => {
    if (!dateStr || ['present', 'sekarang', 'saat ini'].includes(dateStr.toLowerCase())) {
      return new Date()
    }
    if (/^\d{4}$/.test(dateStr.trim())) {
      return new Date(parseInt(dateStr.trim(), 10), 0, 1)
    }
    const monthMap = {
      jan: 0, januari: 0, feb: 1, februari: 1, mar: 2, maret: 2,
      apr: 3, april: 3, mei: 4, may: 4, jun: 5, juni: 5,
      jul: 6, juli: 6, agu: 7, agustus: 7, aug: 7, august: 7,
      sep: 8, september: 8, okt: 9, oktober: 9, oct: 9, october: 9,
      nov: 10, november: 10, des: 11, desember: 11, dec: 11, december: 11,
    }
    const parts = dateStr.trim().toLowerCase().split(/[\s-]+/)
    let month = 0
    let year = new Date().getFullYear()
    parts.forEach((part) => {
      if (/^\d{4}$/.test(part)) year = parseInt(part, 10)
      else if (monthMap[part] !== undefined) month = monthMap[part]
    })
    return new Date(year, month, 1)
  }

  let totalMonths = 0
  pengalaman.forEach((job) => {
    if (job.start) {
      const startDate = parseDate(job.start)
      const endDate = parseDate(job.end)
      let diff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())
      if (diff < 0) diff = 0
      totalMonths += diff
    }
  })
  return parseFloat((totalMonths / 12).toFixed(1))
}

console.log(calculateTotalExperience(KANDIDAT.pengalaman_kerja));
