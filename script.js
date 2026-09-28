// ============================================================
// SIH26030
// AutoSpec-IS
// Automated Cable Specimen Preparation System
// ============================================================


const $ = id => document.getElementById(id);


// ============================================================
// ELEMENTS
// ============================================================

const startBtn = $("startBtn");
const stopBtn = $("stopBtn");

const cableDiameter = $("cableDiameter");
const specimenLength = $("specimenLength");
const testMethod = $("testMethod");
const controllerSelect = $("controllerSelect");

const systemStatus = $("systemStatus");
const statusDot = $("statusDot");

const currentStage = $("currentStage");
const processPercent = $("processPercent");
const progressFill = $("progressFill");

const cable = $("cable");

const diameterBeam = $("diameterBeam");
const diameterValue = $("diameterValue");

const encoderValue = $("encoderValue");

const rollerZone =
    document.querySelector(".roller-zone");

const clampZone =
    $("clampZone") ||
    document.querySelector(".clamp-zone");

const clampStatus = $("clampStatus");

const cuttingZone = $("cuttingZone");

const blade = $("blade");
const bladeStatus = $("bladeStatus");

const cutDepth = $("cutDepth");
const cutZoneLabel = $("cutZoneLabel");

const verificationBeam =
    $("verificationBeam");

const verificationStatus =
    $("verificationStatus");

const specimen = $("specimen");

const wastePiece =
    $("wastePiece");

const commandLog =
    $("commandLog");

const telemetryDiameter =
    $("telemetryDiameter");

const telemetryEncoder =
    $("telemetryEncoder");

const telemetryClamp =
    $("telemetryClamp");

const telemetryCutter =
    $("telemetryCutter");

const telemetryVerification =
    $("telemetryVerification");

const telemetrySafety =
    $("telemetrySafety");

const architectureController =
    $("architectureController");

const archControllerBox =
    $("archControllerBox");

const archLine1 =
    $("archLine1");

const archLine2 =
    $("archLine2");

const archLine3 =
    $("archLine3");

const methodDescription =
    $("methodDescription");

const methodDetails =
    $("methodDetails");

const longitudinalCut =
    $("longitudinalCut");

const ringCut1 =
    $("ringCut1");

const ringCut2 =
    $("ringCut2");

const ringCut3 =
    $("ringCut3");

const sheathSection =
    $("sheathSection");

const controllerModeBadge =
    $("controllerModeBadge");

const badgeLabel =
    $("badgeLabel");

const diagBus =
    $("diagBus");

const diagLogic =
    $("diagLogic");

const diagSpeed =
    $("diagSpeed");

const diagSafety =
    $("diagSafety");

const regTitle =
    $("regTitle");

const regValue =
    $("regValue");

const cycleTitle =
    $("cycleTitle");

const cycleValue =
    $("cycleValue");


// ============================================================
// METHODS
// ============================================================

const methods = {

    resistance: {

        name:
            "Conductor Resistance — IS 10810 context",

        defaultLength:
            100,

        description:
            "Longitudinal preparation workflow for conductor-resistance testing context",

        depth:
            0.35,

        verify:
            "CONDUCTOR ACCESS CHECK",

        label:
            "CONDUCTOR",

        details:
            "The cable is positioned and clamped. A longitudinal preparation routine exposes the conductor region for subsequent laboratory measurement."

    },


    insulation: {

        name:
            "Insulation Thickness — IS 10810 context",

        defaultLength:
            50,

        description:
            "Circumferential preparation workflow for insulation-thickness testing context",

        depth:
            0.22,

        verify:
            "INSULATION SECTION CHECK",

        label:
            "INSULATION",

        details:
            "The cutting station performs a controlled circumferential preparation sequence. The specimen then passes through the verification gate before release."

    },


    sheath: {

        name:
            "Sheath Thickness — IS 7098 context",

        defaultLength:
            50,

        description:
            "Boundary preparation workflow for sheath-thickness testing context",

        depth:
            0.28,

        verify:
            "SHEATH SECTION CHECK",

        label:
            "SHEATH",

        details:
            "Two controlled boundary cuts isolate an outer sheath section for subsequent laboratory dimensional evaluation."

    },


    flame: {

        name:
            "Flame Retardance — IS 10810 context",

        defaultLength:
            150,

        description:
            "Longer specimen preparation workflow for flame-testing context",

        depth:
            0.18,

        verify:
            "FLAME SPECIMEN CHECK",

        label:
            "FLAME TEST",

        details:
            "A longer cable section is prepared using controlled feeding and cutting before the specimen is released for laboratory testing."

    },


    dumbbell: {

        name:
            "Dumbbell Shaping — IS 10810 context",

        defaultLength:
            100,

        description:
            "Profile-preparation workflow for tensile specimen shaping context",

        depth:
            0.20,

        verify:
            "PROFILE CHECK",

        label:
            "DUMBBELL",

        details:
            "The preparation routine represents controlled profile shaping for a subsequent tensile-test specimen workflow."

    }

};


// ============================================================
// CONTROLLERS
// ============================================================

const controllers = {

    esp32: {

        name:
            "ESP32 PROTOTYPE",

        badge:
            "ACTIVE TARGET: ESP32 PROTOTYPE",

        badgeClass:
            "esp32-badge",

        bus:
            "UART / Serial",

        logic:
            "State-Machine Control",

        speed:
            "Prototype Motion Profile",

        failsafe:
            "E-Stop GPIO 27",

        regTitle:
            "Diameter Input",

        regValue:
            "GPIO 34",

        cycleTitle:
            "Process Mode",

        cycleValue:
            "Prototype",

        a1:
            "State-Machine Control",

        a2:
            "Sensor-Driven Decisions",

        a3:
            "Parameterized Actuation"

    },


    plc: {

        name:
            "INDUSTRIAL PLC — IMPLEMENTATION PATH",

        badge:
            "ACTIVE TARGET: INDUSTRIAL PLC",

        badgeClass:
            "plc-badge",

        bus:
            "Industrial Fieldbus / I/O",

        logic:
            "PLC Sequence Control",

        speed:
            "Industrial Motion Profile",

        failsafe:
            "Dedicated E-Stop Circuit",

        regTitle:
            "Controller Interface",

        regValue:
            "PLC I/O / Registers",

        cycleTitle:
            "Deployment Mode",

        cycleValue:
            "Industrial Path",

        a1:
            "PLC Sequence / Interlocks",

        a2:
            "Industrial I/O & HMI",

        a3:
            "Closed-Loop Motion Path"

    }

};


// ============================================================
// STATE
// ============================================================

let running = false;

let emergency = false;


// ============================================================
// SLOWER DEMONSTRATION TIMING
// ============================================================

function sleep(ms) {

    /*
       Slower timing makes every machine operation
       visible in the SIH demonstration video.

       ESP32:
       clearly visible prototype sequence.

       PLC:
       slightly faster, representing implementation path.
    */

    const factor =
        controllerSelect.value === "plc"
            ? 1.35
            : 1.75;

    return new Promise(resolve => {

        setTimeout(
            resolve,
            ms * factor
        );

    });

}


// ============================================================
// LOGGING
// ============================================================

function log(message, type = "INFO") {

    const line =
        document.createElement("div");

    line.className =
        "log-line";

    const tagClass =
        controllerSelect.value === "plc"
            ? "plc-tag"
            : "";

    line.innerHTML =

        `<span class="log-tag ${tagClass}">
            ${type}
        </span>
        ${message}`;

    commandLog.appendChild(line);

    commandLog.scrollTop =
        commandLog.scrollHeight;

}


// ============================================================
// HELPERS
// ============================================================

function stage(value) {

    currentStage.textContent =
        value;

}


function progress(value) {

    value =
        Math.max(
            0,
            Math.min(
                100,
                value
            )
        );

    processPercent.textContent =
        Math.round(value) + "%";

    progressFill.style.width =
        value + "%";

}


function encoder(value) {

    encoderValue.textContent =
        value;

    telemetryEncoder.textContent =
        value;

}


function safety(value) {

    telemetrySafety.textContent =
        value;

}


function selected() {

    return methods[
        testMethod.value
    ];

}


// ============================================================
// CLEAR VISUALS
// ============================================================

function clearVisuals() {

    cuttingZone.classList.remove(
        "circumferential",
        "longitudinal",
        "sheath-mode",
        "flame-mode",
        "cutting-active"
    );


    [
        longitudinalCut,
        ringCut1,
        ringCut2,
        ringCut3,
        sheathSection

    ].forEach(element => {

        if (element) {

            element.classList.remove(
                "visible"
            );

        }

    });


    blade.classList.remove(
        "cut",
        "longitudinal",
        "ring",
        "deep"
    );

}


// ============================================================
// RESET
// ============================================================

function resetVisuals() {

    clearVisuals();


    cable.classList.remove(
        "separated",
        "cutting-glow"
    );


    cable.style.left =
        "45px";


    clampZone.classList.remove(
        "closed"
    );


    clampStatus.textContent =
        "OPEN";

    telemetryClamp.textContent =
        "OPEN";


    bladeStatus.textContent =
        "RETRACTED";

    telemetryCutter.textContent =
        "RETRACTED";


    verificationStatus.textContent =
        "WAITING";

    telemetryVerification.textContent =
        "WAITING";


    verificationBeam.className =
        "verification-beam";


    specimen.classList.remove(
        "visible"
    );


    wastePiece.classList.remove(
        "visible"
    );


    diameterBeam.classList.remove(
        "active"
    );


    rollerZone.classList.remove(
        "active",
        "active-plc"
    );


    progress(0);

    encoder(0);

    stage("READY");

    systemStatus.textContent =
        "READY";

    safety("SAFE");

    document.body.classList.remove(
        "emergency"
    );

}


// ============================================================
// METHOD UI
// ============================================================

function updateMethodUI() {

    const method =
        selected();


    methodDescription.textContent =
        method.description;


    methodDetails.innerHTML = `

        <h3>
            ${method.name}
        </h3>

        <p>
            ${method.details}
        </p>

    `;


    specimenLength.value =
        method.defaultLength;


    clearVisuals();


    if (
        testMethod.value ===
        "resistance"
    ) {

        cuttingZone.classList.add(
            "longitudinal"
        );

        cutZoneLabel.textContent =
            "LONGITUDINAL CUT";

    }

    else if (
        testMethod.value ===
        "insulation"
    ) {

        cuttingZone.classList.add(
            "circumferential"
        );

        cutZoneLabel.textContent =
            "RING CUT ZONE";

    }

    else if (
        testMethod.value ===
        "sheath"
    ) {

        cuttingZone.classList.add(
            "sheath-mode"
        );

        cutZoneLabel.textContent =
            "SHEATH SECTION";

    }

    else if (
        testMethod.value ===
        "flame"
    ) {

        cuttingZone.classList.add(
            "flame-mode"
        );

        cutZoneLabel.textContent =
            "LONG SPECIMEN";

    }

    else {

        cutZoneLabel.textContent =
            "PROFILE PREPARATION";

    }


    log(
        `Preset recipe selected: ${method.name}`,
        "RECIPE"
    );

}


// ============================================================
// CONTROLLER UI
// ============================================================

function updateControllerUI() {

    const profile =
        controllers[
            controllerSelect.value
        ];


    controllerModeBadge.className =
        "controller-badge " +
        profile.badgeClass;


    badgeLabel.textContent =
        profile.badge;


    diagBus.textContent =
        profile.bus;

    diagLogic.textContent =
        profile.logic;

    diagSpeed.textContent =
        profile.speed;

    diagSafety.textContent =
        profile.failsafe;


    regTitle.textContent =
        profile.regTitle;

    regValue.textContent =
        profile.regValue;


    cycleTitle.textContent =
        profile.cycleTitle;

    cycleValue.textContent =
        profile.cycleValue;


    architectureController.textContent =
        profile.name;

    archLine1.textContent =
        profile.a1;

    archLine2.textContent =
        profile.a2;

    archLine3.textContent =
        profile.a3;


    archControllerBox.classList.toggle(
        "plc-active",
        controllerSelect.value === "plc"
    );


    document.body.classList.toggle(
        "plc-mode",
        controllerSelect.value === "plc"
    );


    log(
        `Controller target changed to: ${profile.name}`,
        "TARGET"
    );


    fetch(
        "/api/configure",
        {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                controller:
                    controllerSelect.value,

                diameter:
                    cableDiameter.value,

                length:
                    specimenLength.value,

                test_method:
                    testMethod.value

            })

        }

    ).catch(() => {});

}


// ============================================================
// DIAMETER
// ============================================================

async function detectDiameter() {

    stage(
        "DIAMETER DETECTION"
    );


    diameterBeam.classList.add(
        "active"
    );


    log(
        "Diameter sensing input sampled for cable OD",
        "SENSOR"
    );


    await sleep(850);


    if (emergency) {
        return false;
    }


    const diameter =
        Math.max(
            5,
            Math.min(
                25,
                parseFloat(
                    cableDiameter.value
                ) || 12
            )
        );


    diameterValue.textContent =
        diameter.toFixed(1);


    telemetryDiameter.textContent =
        diameter.toFixed(1) +
        " mm";


    diameterBeam.classList.remove(
        "active"
    );


    log(
        `Cable OD detected: ${diameter.toFixed(1)} mm`,
        "SENSOR"
    );


    progress(15);

    return true;

}


// ============================================================
// PARAMETER SETUP
// ============================================================

async function parameterSetup() {

    const method =
        selected();


    stage(
        "RECIPE COMPUTATION"
    );


    await sleep(800);


    if (emergency) {
        return false;
    }


    const diameter =
        parseFloat(
            cableDiameter.value
        ) || 12;


    const depth =
        Math.max(
            1,
            diameter * method.depth
        );


    cutDepth.textContent =
        depth.toFixed(2);


    log(
        `Preparation parameter calculated: ${depth.toFixed(2)} mm`,
        "PARAM"
    );


    progress(25);

    return true;

}


// ============================================================
// FEEDING
// ============================================================

async function feedCable() {

    stage(
        "FEEDING CABLE"
    );


    const plc =
        controllerSelect.value ===
        "plc";


    rollerZone.classList.add(
        plc
            ? "active-plc"
            : "active"
    );


    log(
        "Motor-driven feed rollers positioning cable",
        "MOTION"
    );


    /*
       Gradually move cable forward.
    */

    for (
        let i = 0;
        i <= 16;
        i++
    ) {

        if (emergency) {

            rollerZone.classList.remove(
                "active",
                "active-plc"
            );

            return false;

        }


        const ratio =
            i / 16;


        const position =
            45 +
            (
                120 - 45
            ) * ratio;


        cable.style.left =
            position + "px";


        encoder(
            Math.round(
                1200 * ratio
            )
        );


        progress(
            25 +
            ratio * 27
        );


        await sleep(100);

    }


    rollerZone.classList.remove(
        "active",
        "active-plc"
    );


    log(
        "Target feed position reached",
        "FEEDBACK"
    );


    return true;

}


// ============================================================
// CLAMPING
// ============================================================

async function clampCable() {

    stage(
        "ACTIVE CLAMPING"
    );


    await sleep(650);


    if (emergency) {
        return false;
    }


    clampZone.classList.add(
        "closed"
    );


    clampStatus.textContent =
        "LOCKED";


    telemetryClamp.textContent =
        "LOCKED";


    log(
        "Automatic clamp secured specimen position",
        "ACT"
    );


    progress(58);


    await sleep(650);


    return true;

}


// ============================================================
// CUTTING
// ============================================================

async function performCut() {

    const method =
        testMethod.value;


    stage(
        "SPECIMEN PREPARATION"
    );


    cuttingZone.classList.add(
        "cutting-active"
    );


    cable.classList.add(
        "cutting-glow"
    );


    log(
        `Executing ${selected().name} preparation sequence`,
        "CUTTER"
    );


    if (
        method ===
        "resistance"
    ) {

        blade.classList.add(
            "longitudinal",
            "deep"
        );


        longitudinalCut.classList.add(
            "visible"
        );


        bladeStatus.textContent =
            "AXIAL PREP";


        telemetryCutter.textContent =
            "AXIAL PREP";


        await sleep(1600);


        progress(78);

    }


    else if (
        method ===
        "insulation"
    ) {

        blade.classList.add(
            "ring",
            "cut"
        );


        const rings = [

            [ringCut1, 1],
            [ringCut2, 2],
            [ringCut3, 3]

        ];


        for (
            const [element, number]
            of rings
        ) {

            bladeStatus.textContent =
                `RING CUT ${number}/3`;


            telemetryCutter.textContent =
                `RING ${number}/3`;


            await sleep(600);


            if (emergency) {
                return false;
            }


            element.classList.add(
                "visible"
            );


            progress(
                62 +
                number * 5
            );

        }

    }


    else if (
        method ===
        "sheath"
    ) {

        blade.classList.add(
            "cut"
        );


        sheathSection.classList.add(
            "visible"
        );


        bladeStatus.textContent =
            "BOUNDARY CUTS";


        telemetryCutter.textContent =
            "BOUNDARY CUTS";


        await sleep(1600);


        progress(78);

    }


    else if (
        method ===
        "flame"
    ) {

        blade.classList.add(
            "cut"
        );


        bladeStatus.textContent =
            "LONG SPECIMEN";


        telemetryCutter.textContent =
            "LONG SPECIMEN";


        await sleep(1800);


        progress(78);

    }


    else {

        blade.classList.add(
            "cut"
        );


        bladeStatus.textContent =
            "PROFILE PREP";


        telemetryCutter.textContent =
            "PROFILE PREP";


        await sleep(1600);


        progress(78);

    }


    if (emergency) {
        return false;
    }


    blade.classList.remove(
        "cut",
        "deep",
        "longitudinal",
        "ring"
    );


    cuttingZone.classList.remove(
        "cutting-active"
    );


    cable.classList.remove(
        "cutting-glow"
    );


    bladeStatus.textContent =
        "RETRACTED";


    telemetryCutter.textContent =
        "RETRACTED";


    log(
        "Cutting actuator retracted to safe position",
        "FEEDBACK"
    );


    progress(82);


    await sleep(500);


    return true;

}


// ============================================================
// VERIFICATION
// ============================================================

async function verifySpecimen() {

    const method =
        selected();


    stage(
        "SPECIMEN VERIFICATION"
    );


    verificationStatus.textContent =
        "SCANNING";


    telemetryVerification.textContent =
        "SCANNING";


    verificationBeam.classList.add(
        "scanning"
    );


    log(
        "Verification sensor checking prepared specimen",
        "INSPECT"
    );


    await sleep(1800);


    if (emergency) {
        return false;
    }


    verificationBeam.classList.remove(
        "scanning"
    );


    verificationBeam.classList.add(
        "passed"
    );


    verificationStatus.textContent =
        method.verify;


    telemetryVerification.textContent =
        "PASSED";


    log(
        `Verification passed: ${method.verify}`,
        "PASS"
    );


    progress(92);


    await sleep(650);


    return true;

}


// ============================================================
// EJECTION
// ============================================================

async function ejectSpecimen() {

    const method =
        selected();


    stage(
        "EJECTION CYCLE"
    );


    await sleep(750);


    if (emergency) {
        return false;
    }


    clampZone.classList.remove(
        "closed"
    );


    clampStatus.textContent =
        "OPEN";


    telemetryClamp.textContent =
        "OPEN";


    specimen.textContent =
        method.label;


    specimen.classList.add(
        "visible"
    );


    cable.classList.add(
        "separated"
    );


    log(
        "Clamp released and specimen transferred to output",
        "OUTPUT"
    );


    progress(95);


    await sleep(900);


    return true;

}


// ============================================================
// GRADUAL CABLE RETURN
// ============================================================

async function returnHome() {

    stage(
        "RETURN TO HOME"
    );


    /*
       Cable currently sits at approximately
       120px after feeding.

       Move it gradually to 45px.

       This is deliberately slow so that
       the return motion is clearly visible.
    */

    const startPosition = 120;

    const homePosition = 45;

    const totalSteps = 24;


    log(
        "Feed carriage beginning return-to-home sequence",
        "RETURN"
    );


    for (
        let i = 0;
        i <= totalSteps;
        i++
    ) {

        if (emergency) {
            return false;
        }


        const ratio =
            i / totalSteps;


        const currentPosition =
            startPosition -
            (
                (
                    startPosition -
                    homePosition
                ) * ratio
            );


        cable.style.left =
            currentPosition + "px";


        const currentEncoder =
            Math.round(
                1200 *
                (1 - ratio)
            );


        encoder(
            currentEncoder
        );


        progress(
            95 +
            ratio * 4
        );


        await sleep(160);

    }


    cable.style.left =
        homePosition + "px";


    encoder(0);

    progress(99);


    log(
        "Feed carriage reached home position — encoder zeroed",
        "RETURN"
    );


    await sleep(700);


    return true;

}


// ============================================================
// COMPLETE
// ============================================================

async function completeProcess() {

    stage(
        "CYCLE COMPLETE"
    );


    systemStatus.textContent =
        "COMPLETED";


    safety(
        "SAFE"
    );


    progress(100);


    /*
       Waste appears ONLY after successful
       completion of the entire cycle.
    */

    await sleep(350);


    wastePiece.classList.add(
        "visible"
    );


    log(
        "Cycle complete — specimen output and waste handling sequence finished",
        "SUCCESS"
    );


    await sleep(900);

}


// ============================================================
// START
// ============================================================

async function startProcess() {

    if (running) {
        return;
    }


    emergency = false;

    running = true;


    startBtn.disabled =
        true;


    stopBtn.disabled =
        false;


    resetVisuals();


    systemStatus.textContent =
        "EXECUTING";


    safety(
        "INTERLOCKED"
    );


    const method =
        selected();


    const profile =
        controllers[
            controllerSelect.value
        ];


    log(
        "========================================",
        "SYS"
    );


    log(
        `RUNNING: ${method.name} via ${profile.name}`,
        "SYSTEM"
    );


    log(
        `Target length: ${specimenLength.value} mm`,
        "CONFIG"
    );


    fetch(
        "/api/start",
        {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                controller:
                    controllerSelect.value,

                diameter:
                    cableDiameter.value,

                length:
                    specimenLength.value,

                test_method:
                    testMethod.value

            })

        }

    ).catch(() => {});


    const steps = [

        detectDiameter,

        parameterSetup,

        feedCable,

        clampCable,

        performCut,

        verifySpecimen,

        ejectSpecimen,

        returnHome

    ];


    for (
        const step of steps
    ) {

        const success =
            await step();


        if (!success) {

            finishProcess();

            return;

        }

    }


    await completeProcess();


    finishProcess();

}


// ============================================================
// FINISH
// ============================================================

function finishProcess() {

    running =
        false;


    startBtn.disabled =
        false;


    stopBtn.disabled =
        false;

}


// ============================================================
// EMERGENCY STOP
// ============================================================

function emergencyStop() {

    if (
        !running &&
        !emergency
    ) {

        return;

    }


    emergency =
        true;


    running =
        false;


    document.body.classList.add(
        "emergency"
    );


    systemStatus.textContent =
        "EMERGENCY HALT";


    stage(
        "EMERGENCY STOP"
    );


    safety(
        "CUT-OFF"
    );


    rollerZone.classList.remove(
        "active",
        "active-plc"
    );


    cuttingZone.classList.remove(
        "cutting-active"
    );


    blade.classList.remove(
        "cut",
        "deep",
        "longitudinal",
        "ring"
    );


    clampZone.classList.remove(
        "closed"
    );


    clampStatus.textContent =
        "OPEN";


    telemetryClamp.textContent =
        "OPEN";


    bladeStatus.textContent =
        "HALTED";


    telemetryCutter.textContent =
        "HALTED";


    verificationBeam.className =
        "verification-beam";


    verificationStatus.textContent =
        "HALTED";


    telemetryVerification.textContent =
        "HALTED";


    log(
        "EMERGENCY STOP TRIGGERED — motion sequence halted",
        "E-STOP"
    );


    fetch(
        "/api/emergency_stop",
        {
            method: "POST"
        }
    ).catch(() => {});


    startBtn.disabled =
        false;

}


// ============================================================
// EVENTS
// ============================================================

startBtn.addEventListener(
    "click",
    startProcess
);


stopBtn.addEventListener(
    "click",
    emergencyStop
);


testMethod.addEventListener(
    "change",
    updateMethodUI
);


controllerSelect.addEventListener(
    "change",
    updateControllerUI
);


// ============================================================
// INITIALIZATION
// ============================================================

resetVisuals();

updateMethodUI();

updateControllerUI();


log(
    "AutoSpec-IS supervisory interface ready on port 5001",
    "INIT"
);