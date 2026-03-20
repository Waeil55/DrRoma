# Fixed script to add DraggableTutorPanel to all views missing it

$filePath = "src\App.jsx"

$viewLabels = @{
  'MedicalCalculatorView'       = 'Medical Calculators'
  'StudyPlanView'               = 'Study Plan'
  'ClinicalSimulatorView'       = 'Clinical Simulator'
  'ProgressReportView'          = 'Progress Report'
  'DocumentAnnotationsView'     = 'Document Annotations'
  'MedicalGlossaryView'         = 'Medical Glossary'
  'DrugInteractionCheckerView'  = 'Drug Interaction Checker'
  'VitalSignsTrackerView'       = 'Vital Signs Tracker'
  'PharmacologyQuickRefView'    = 'Pharmacology Reference'
  'ClinicalGuidelinesView'      = 'Clinical Guidelines'
  'PatientHandoutView'          = 'Patient Handout'
  'ProcedureChecklistView'      = 'Procedure Checklist'
  'EBMToolsView'                = 'Evidence-Based Medicine'
  'OSCEPrepView'                = 'OSCE Prep'
  'ECGInterpreterView'          = 'ECG Interpreter'
  'RadiologyInterpreterView'    = 'Radiology Interpreter'
  'PediatricDosingView'         = 'Pediatric Dosing'
  'FluidElectrolyteView'        = 'Fluid & Electrolytes'
  'ImageQuizView'               = 'Image Quiz'
  'CriticalCareProtocolsView'   = 'Critical Care Protocols'
  'BloodGasInterpreterView'     = 'Blood Gas Interpreter'
  'InfectiousDiseaseGuideView'  = 'Infectious Disease Guide'
  'ToxicologyView'              = 'Toxicology'
  'PathologyQuickRefView'       = 'Pathology Reference'
  'MicrobiologyGuideView'       = 'Microbiology Guide'
  'NutritionCalculatorView'     = 'Nutrition Calculator'
  'PsychiatryScreeningView'     = 'Psychiatry Screening'
  'ResearchMethodsView'         = 'Research Methods'
  'CommunicationSkillsView'     = 'Communication Skills'
  'QualityImprovementView'      = 'Quality Improvement'
  'ObGynCalculatorsView'        = 'OB/GYN Calculators'
  'MedicalEthicsView'           = 'Medical Ethics'
  'WoundCareGuideView'          = 'Wound Care'
  'PainManagementView'          = 'Pain Management'
  'GeriatricAssessmentView'     = 'Geriatric Assessment'
  'PalliativeCareView'          = 'Palliative Care'
  'SurgicalAnatomyView'         = 'Surgical Anatomy'
  'TransfusionMedicineView'     = 'Transfusion Medicine'
  'AntibioticStewardshipView'   = 'Antibiotic Stewardship'
  'VentilatorGraphsView'        = 'Ventilator Graphics'
  'HemodynamicCalculatorView'   = 'Hemodynamic Calculator'
  'DermatologyAtlasView'        = 'Dermatology Atlas'
  'OphthalmologyGuideView'      = 'Ophthalmology Guide'
  'NephrologyGuideView'         = 'Nephrology Guide'
  'EndocrinologyGuideView'      = 'Endocrinology Guide'
  'HematologyGuideView'         = 'Hematology Guide'
  'RheumatologyGuideView'       = 'Rheumatology Guide'
  'NeurologyGuideView'          = 'Neurology Guide'
  'CardiologyGuideView'         = 'Cardiology Guide'
  'PulmonologyGuideView'        = 'Pulmonology Guide'
  'GastroenterologyGuideView'   = 'Gastroenterology Guide'
  'EmergencyMedicineGuideView'  = 'Emergency Medicine Guide'
  'OrthopedicsGuideView'        = 'Orthopedics Guide'
  'ENTGuideView'                = 'ENT Guide'
  'UrologyGuideView'            = 'Urology Guide'
}

$lines = Get-Content $filePath

# Build function line map (0-indexed)
$funcLineMap = @{}
for ($i = 0; $i -lt $lines.Count; $i++) {
  foreach ($funcName in $viewLabels.Keys) {
    if ($lines[$i] -match "^function $funcName\b") {
      $funcLineMap[$funcName] = $i
    }
  }
}

Write-Host "Located $($funcLineMap.Count) of $($viewLabels.Count) functions"

# Get all View function start lines for range calculation (1-indexed from Select-String)
$allFuncStarts1 = (Select-String -Path $filePath -Pattern "^function [A-Z]\w+").LineNumber | Sort-Object

$insertions = @{}

foreach ($funcName in ($funcLineMap.Keys | Sort-Object { $funcLineMap[$_] })) {
  $funcStart0 = $funcLineMap[$funcName]  # 0-indexed
  $funcStart1 = $funcStart0 + 1          # 1-indexed
  $label = $viewLabels[$funcName]

  # Find end of function = next function start - 1
  $nextStart1 = $allFuncStarts1 | Where-Object { $_ -gt $funcStart1 } | Select-Object -First 1
  if ($nextStart1) {
    $funcEnd0 = $nextStart1 - 2  # 0-indexed: nextStart1-1 is 0-indexed nextStart, nextStart1-2 is the last line before
  } else {
    $funcEnd0 = $lines.Count - 1
  }

  # Check for existing DraggableTutorPanel
  $hasTutor = $false
  for ($i = $funcStart0; $i -le $funcEnd0; $i++) {
    if ($lines[$i] -match 'DraggableTutorPanel') { $hasTutor = $true; break }
  }
  if ($hasTutor) {
    Write-Host "SKIP $funcName (already has DraggableTutorPanel)"
    continue
  }

  # Find the insert point: scan for pattern "    </div>\n  );\n}"
  # Search backwards from funcEnd0
  $insertLine = $null
  for ($i = $funcEnd0; $i -ge ($funcStart0 + 5); $i--) {
    # Look for the exact 3-line closing pattern:
    #   line i:   }
    #   line i-1:   );
    #   line i-2:     </div>   <-- this is outer flex wrapper close
    if ($lines[$i] -eq '}' -and
        $lines[$i-1] -match '^\s+\);\s*$' -and
        $lines[$i-2] -match '^\s+</div>\s*$') {
      $insertLine = $i - 2  # Insert DraggableTutorPanel BEFORE the outer </div>
      break
    }
  }

  if ($null -eq $insertLine) {
    Write-Host "WARNING: No insert point for $funcName (range $funcStart0-$funcEnd0)"
    # Debug: show last 10 lines of function
    $debugStart = [Math]::Max($funcStart0, $funcEnd0 - 10)
    for ($d = $debugStart; $d -le $funcEnd0; $d++) {
      Write-Host "  L$($d+1): '$($lines[$d])'"
    }
    continue
  }

  $tutorLine = "      <DraggableTutorPanel context={{ tool: '$label' }} contextLabel=`"$label`" settings={_appSettings} defaultMode=`"floating`" />"
  Write-Host "OK $funcName -> insert at L$($insertLine+1)"
  $insertions[$insertLine] = $tutorLine
}

Write-Host "`nApplying $($insertions.Count) insertions..."

# Apply in reverse order to preserve line indices
$sortedPoints = $insertions.Keys | Sort-Object -Descending
$linesList = [System.Collections.Generic.List[string]]($lines)

foreach ($pt in $sortedPoints) {
  $linesList.Insert($pt, $insertions[$pt])
}

$linesList | Set-Content $filePath -Encoding UTF8
Write-Host "Done! $($insertions.Count) DraggableTutorPanel entries added."
