# ==============================================================================
# EarthScape Climate Agency - Climate Data Statistical Analysis & Modeling in R
# Environment: R / RStudio (64-Bit)
# Objective:
#   - Ingest historical and synthetic anomaly climate records
#   - Compute descriptive summary statistics
#   - Pearson and Spearman correlation analysis
#   - ANOVA / Kruskal-Wallis across geographic weather stations
#   - Time-series trend analysis & linear regression modeling
# ==============================================================================

# 1. Load required packages (Install if missing)
required_packages <- c("ggplot2", "dplyr", "tidyr", "corrplot", "lubridate")
for (pkg in required_packages) {
  if (!require(pkg, character.only = TRUE, quietly = TRUE)) {
    message(paste("Package", pkg, "not loaded. Base R fallbacks will be used if needed."))
  }
}

# 2. Data Ingestion
project_root <- normalizePath(file.path(getwd()))
normal_path <- file.path(project_root, "data", "sample", "normal_data.csv")
anomaly_path <- file.path(project_root, "data", "sample", "anomaly_data.csv")

if (!file.exists(normal_path)) {
  # Fallback if executing from inside r_analysis folder
  normal_path <- file.path("..", "data", "sample", "normal_data.csv")
  anomaly_path <- file.path("..", "data", "sample", "anomaly_data.csv")
}

cat("[*] Ingesting EarthScape climate datasets...\n")
df_normal <- read.csv(normal_path, stringsAsFactors = FALSE)
df_anomaly <- read.csv(anomaly_path, stringsAsFactors = FALSE)

# Combine datasets
climate_df <- rbind(df_normal, df_anomaly)
climate_df$date <- as.Date(climate_df$date)
climate_df <- climate_df[order(climate_df$location, climate_df$date), ]

cat(sprintf("[+] Successfully loaded %d records across %d weather stations.\n",
            nrow(climate_df), length(unique(climate_df$location))))

# 3. Descriptive Statistical Summary
cat("\n--- Descriptive Statistics (Temperature, Humidity, Rainfall, CO2) ---\n")
numeric_cols <- c("temperature", "humidity", "rainfall", "wind_speed", "air_pressure", "co2")
summary_stats <- summary(climate_df[, numeric_cols])
print(summary_stats)

# Standard Deviations
cat("\n--- Standard Deviations ---\n")
sds <- sapply(climate_df[, numeric_cols], sd, na.rm = TRUE)
print(round(sds, 2))

# 4. Correlation Analysis (Pearson Matrix)
cat("\n--- Pearson Correlation Matrix ---\n")
corr_mat <- cor(climate_df[, numeric_cols], use = "complete.obs", method = "pearson")
print(round(corr_mat, 3))

# Key Climate Relationship Check
cat("\n--- Key Climate Insights ---\n")
cat(sprintf("Temperature vs CO2 Correlation: %.3f\n", corr_mat["temperature", "co2"]))
cat(sprintf("Temperature vs Humidity Correlation: %.3f\n", corr_mat["temperature", "humidity"]))
cat(sprintf("Rainfall vs Humidity Correlation: %.3f\n", corr_mat["rainfall", "humidity"]))

# 5. One-Way ANOVA: Testing Temperature Differences across Stations
cat("\n--- One-Way ANOVA: Temperature Variation by Location ---\n")
anova_model <- aov(temperature ~ location, data = climate_df)
print(summary(anova_model))

# 6. Time-Series Linear Trend Regression Model
sample_station <- unique(climate_df$location)[1]
station_df <- subset(climate_df, location == sample_station)
station_df$day_index <- as.numeric(station_df$date - min(station_df$date))

trend_model <- lm(temperature ~ day_index, data = station_df)
cat(sprintf("\n--- Trend Regression Model for %s ---\n", sample_station))
print(summary(trend_model))

# 7. Statistical Anomaly Identification (Z-Score method)
temp_mean <- mean(climate_df$temperature, na.rm = TRUE)
temp_sd <- sd(climate_df$temperature, na.rm = TRUE)
climate_df$z_score_temp <- abs(climate_df$temperature - temp_mean) / temp_sd
anomalies_detected <- subset(climate_df, z_score_temp > 2.5)

cat(sprintf("\n[!] Total climate anomalies identified (|Z| > 2.5): %d records (%.2f%% of data)\n",
            nrow(anomalies_detected), (nrow(anomalies_detected) / nrow(climate_df)) * 100))

# 8. Export Processed Analytical Dataset for R/Tableau Integration
output_file <- file.path(project_root, "data", "processed", "earthscape_r_processed.csv")
if (!dir.exists(dirname(output_file))) {
  dir.create(dirname(output_file), recursive = TRUE)
}
write.csv(climate_df, output_file, row.names = FALSE)
cat(sprintf("[+] Processed R analysis dataset exported to:\n    %s\n", output_file))
cat("\n[✓] EarthScape R analysis pipeline executed successfully.\n")
