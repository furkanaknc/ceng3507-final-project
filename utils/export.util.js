export function exportToCSV(farmers) {
    // Define CSV headers
    const headers = ['ID', 'Name', 'Contact', 'Location'];
    
    // Convert farmers data to CSV rows
    const rows = farmers.map(farmer => [
        farmer.id,
        farmer.name,
        farmer.contact,
        farmer.location
    ]);
    
    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'farmers_data.csv');
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}