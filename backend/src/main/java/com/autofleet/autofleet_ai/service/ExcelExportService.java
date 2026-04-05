package com.autofleet.autofleet_ai.service;

import com.autofleet.autofleet_ai.entity.MaintenanceRecord;
import com.autofleet.autofleet_ai.entity.Vehicle;
import com.autofleet.autofleet_ai.repository.VehicleRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class ExcelExportService {

    private final VehicleRepository vehicleRepository;

    public ExcelExportService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public byte[] generateVehicleReport(Long vehicleId) throws IOException {

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found!"));

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Vehicle Report");

            // styles
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_TEAL.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            CellStyle boldStyle = workbook.createCellStyle();
            Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            boldStyle.setFont(boldFont);

            // section 1 vehicle details
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("VEHICLE DIAGNOSTIC REPORT: " + vehicle.getLicensePlate());
            titleCell.setCellStyle(boldStyle);

            int rowIdx = 8;
            Row tableHeader = sheet.createRow(rowIdx++);

            String[] columns = {"Date", "Description", "Cost (USD)"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = tableHeader.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // tabelul de istoric populat
            double totalCost = 0;
            if (vehicle.getMaintenanceHistory() != null) {
                for (MaintenanceRecord record : vehicle.getMaintenanceHistory()) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(record.getServiceDate() != null ? record.getServiceDate().toString() : "N/A");
                    row.createCell(1).setCellValue(record.getDescription());

                    Cell costCell = row.createCell(2);
                    costCell.setCellValue(record.getCost());
                    totalCost += record.getCost();
                }
            }

            // total cost
            Row totalRow = sheet.createRow(rowIdx + 1);
            totalRow.createCell(1).setCellValue("TOTAL MAINTENANCE COST:");
            totalRow.getCell(1).setCellStyle(boldStyle);
            totalRow.createCell(2).setCellValue("$" + totalCost);
            totalRow.getCell(2).setCellStyle(boldStyle);

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
