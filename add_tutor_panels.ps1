# Script to add DraggableTutorPanel to all views missing it
# Approach: insert DraggableTutorPanel before the closing outer </div> of each view

$filePath = "src\App.jsx"
$content = Get-Content $filePath -Raw

# Map of function name → display label for DraggableTutorPanel
$viewLabels = @{
  'MedicalCalculatorView'       = 'Medical Calculators'
  'StudyPlanView'               = 'Study Plan'
  'ClinicalSimulatorView'       = 'Clinical Simulator'
  'ProgressReportView'          = 'Progress Report'
  'DocumentAnnotationsView'     = 'Document Annotations'
  'MedicalGlossaryView'         = 'Medical Glossary'
  'DrugInteractionCheckerView'  = 'Drug Interaction Checker'
  'PrescriptionPadView'         = 'Prescription Pad'
  'VitalSignsTrackerView'       = 'Vital Signs Tracker'
  'PharmacologyQuickRefView'    = 'Pharmacology Reference'
  'ClinicalGuidelinesView'      = 'Clinical Guidelines'
  'PatientHandoutView'          = 'Patient Handout'
  'ProcedureChecklistView'      = 'Procedure Checklist'
  'EBMToolsView'                = 'Evidence-Based Medicine'
  'AnatomyQuickRefView'         = 'Anatomy Reference'
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

# Build function line map
$funcLineMap = @{}
for ($i = 0; $i -lt $lines.Count; $i++) {
  foreach ($funcName in $viewLabels.Keys) {
    if ($lines[$i] -match "^function $funcName\b") {
      $funcLineMap[$funcName] = $i  # 0-indexed
    }
  }
}

# Sort by line number ascending
$sortedFuncs = $funcLineMap.GetEnumerator() | Sort-Object Value

Write-Host "Found $($sortedFuncs.Count) functions to process"

# Get all function start positions to determine end of each function
$allFuncStarts = (Select-String -Path $filePath -Pattern "^function [A-Z]\w+").LineNumber | Sort-Object

# Also get "export default"
$exportLine = (Select-String -Path $filePath -Pattern "^export default").LineNumber | Sort-Object | Select-Object -First 1

# Insert DraggableTutorPanel into each function
# We'll collect all insertions (line_index -> text_to_insert_BEFORE_that_line)
# Then apply them in reverse order to preserve line numbers

$insertions = @{}

foreach ($entry in $sortedFuncs) {
  $funcName = $entry.Key
  $funcStartLine = $entry.Value  # 0-indexed
  $label = $viewLabels[$funcName]

  # Find the end of this function (next function start - 1, or EOF)
  $nextFuncLine = $allFuncStarts | Where-Object { $_ -gt ($funcStartLine + 1) } | Select-Object -First 1
  if ($nextFuncLine) {
    $funcEndLine = $nextFuncLine - 2  # 0-indexed: nextFuncLine is 1-indexed
  } else {
    $funcEndLine = $lines.Count - 1
  }

  # Check if DraggableTutorPanel already exists in this function
  $funcSlice = $lines[$funcStartLine..$funcEndLine]
  $hasTutor = $funcSlice | Select-String "DraggableTutorPanel"
  if ($hasTutor) {
    Write-Host "SKIP $funcName (already has DraggableTutorPanel)"
    continue
  }

  # Find the closing pattern: look for "  );" followed by "}" within the function
  # We want to find the line with "    </div>" that is the outer wrapper close
  # Pattern: search backwards from funcEndLine for the pattern "    </div>" followed by "  );" followed by "}"
  $insertLine = $null
  for ($i = $funcEndLine; $i -ge $funcStartLine; $i--) {
    $line = $lines[$i]
    # Look for the closing "}" of the function
    if ($line -eq '}' -and $i -lt $funcEndLine) { continue }
    if ($line -eq '}') {
      # Found function closing brace, look back for ");"
      if ($i -ge 1 -and $lines[$i-1] -match '^\s+\);\s*$') {
        # Found the return closing ); - now look for the outer div close
        for ($j = $i - 2; $j -ge $funcStartLine; $j--) {
          $jline = $lines[$j]
          if ($jline -match '^\s+</div>\s*$') {
            # This is the outer wrapper close - insert BEFORE this line
            $insertLine = $j
            break
          }
          # If we hit a non-whitespace, non-closing-div line, stop
          if ($jline.Trim() -ne '' -and $jline -notmatch '^\s+</div>\s*$' -and $jline -notmatch '^\s*$') {
            break
          }
        }
        break
      }
    }
  }

  if ($null -eq $insertLine) {
    Write-Host "WARNING: Could not find insert point for $funcName (lines $funcStartLine-$funcEndLine)"
    continue
  }

  $tutorText = "      <DraggableTutorPanel context={{ tool: '$label' }} contextLabel=`"$label`" settings={_appSettings} defaultMode=`"floating`" />"
  Write-Host "INSERT into $funcName at line $($insertLine+1): $tutorText"
  $insertions[$insertLine] = $tutorText
}

Write-Host "`nApplying $($insertions.Count) insertions..."

# Apply insertions in reverse order
$sortedInsertPoints = $insertions.Keys | Sort-Object -Descending
$linesList = [System.Collections.Generic.List[string]]($lines)

foreach ($insertPoint in $sortedInsertPoints) {
  $linesList.Insert($insertPoint, $insertions[$insertPoint])
}

# Write back to file
$linesList | Set-Content $filePath -Encoding UTF8

Write-Host "Done! File written with $($insertions.Count) DraggableTutorPanel insertions."
