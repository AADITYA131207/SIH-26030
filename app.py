from flask import Flask, render_template, jsonify, request
import time

app = Flask(__name__)


# ============================================================
# SYSTEM STATE
# ============================================================

system_state = {
    "system_id": "SIH26030",
    "state": "READY",
    "progress": 0,

    "controller": "ESP32",

    "cable_od_mm": 12.0,
    "specimen_length_mm": 50.0,

    "test_method": "insulation",

    "cut_depth_mm": 0.0,
    "encoder_pulses": 0,

    "start_time": None,

    "verification": "WAITING",

    "cycle_id": 0
}


# ============================================================
# PREPARATION METHODS
# ============================================================

METHODS = {
    "resistance": {
        "name": "Conductor Resistance",
        "default_length": 100,
        "depth_factor": 0.25
    },

    "insulation": {
        "name": "Insulation Thickness",
        "default_length": 50,
        "depth_factor": 0.25
    },

    "sheath": {
        "name": "Sheath Thickness",
        "default_length": 50,
        "depth_factor": 0.25
    },

    "flame": {
        "name": "Flame Retardance",
        "default_length": 150,
        "depth_factor": 0.18
    },

    "dumbbell": {
        "name": "Dumbbell Shaping",
        "default_length": 100,
        "depth_factor": 0.20
    }
}


# ============================================================
# HOME
# ============================================================

@app.route("/")
def home():
    return render_template("index.html")


# ============================================================
# STATUS API
# ============================================================

@app.route("/api/status")
def status():

    state = system_state["state"]

    # --------------------------------------------------------
    # These states must remain fixed.
    # --------------------------------------------------------

    if state in (
        "READY",
        "EMERGENCY_STOP",
        "COMPLETED"
    ):
        return jsonify({
            "system": system_state["system_id"],
            "state": system_state["state"],
            "progress": system_state["progress"],
            "controller": system_state["controller"],
            "cable_diameter_mm": system_state["cable_od_mm"],
            "specimen_length_mm": system_state["specimen_length_mm"],
            "test_method": system_state["test_method"],
            "cut_depth_mm": system_state["cut_depth_mm"],
            "encoder_pulses": system_state["encoder_pulses"],
            "verification": system_state["verification"],
            "cycle_id": system_state["cycle_id"]
        })


    # --------------------------------------------------------
    # Calculate elapsed simulation time.
    # --------------------------------------------------------

    if system_state["start_time"] is not None:
        elapsed = (
            time.time()
            - system_state["start_time"]
        )
    else:
        elapsed = 0


    # Dashboard simulation timing only.
    # This is NOT a measured machine cycle time.

    if system_state["controller"] == "ESP32":
        target = 12.0
    else:
        target = 6.0


    progress = min(
        100,
        int((elapsed / target) * 100)
    )


    system_state["progress"] = progress


    # --------------------------------------------------------
    # PROCESS STATES
    # --------------------------------------------------------

    if progress < 15:

        system_state["state"] = (
            "DIAMETER DETECTION"
        )

        system_state["verification"] = (
            "WAITING"
        )


    elif progress < 30:

        system_state["state"] = (
            "PARAMETER SETUP"
        )

        system_state["verification"] = (
            "WAITING"
        )


    elif progress < 52:

        system_state["state"] = (
            "FEEDING"
        )

        system_state["verification"] = (
            "WAITING"
        )

        system_state["encoder_pulses"] = int(
            (progress - 30) * 50
        )


    elif progress < 62:

        system_state["state"] = (
            "CLAMPING"
        )

        system_state["verification"] = (
            "WAITING"
        )


    elif progress < 82:

        system_state["state"] = (
            "PREPARING"
        )

        system_state["verification"] = (
            "WAITING"
        )

        # ----------------------------------------------------
        # Calculate prototype cutting parameter.
        # ----------------------------------------------------

        method = system_state["test_method"]

        if method in METHODS:
            factor = METHODS[method]["depth_factor"]
        else:
            factor = 0.25

        system_state["cut_depth_mm"] = round(
            system_state["cable_od_mm"] * factor,
            2
        )


    elif progress < 94:

        system_state["state"] = (
            "VERIFYING"
        )

        system_state["verification"] = (
            "SCANNING"
        )


    elif progress < 100:

        system_state["state"] = (
            "EJECTING"
        )

        system_state["verification"] = (
            "PASSED"
        )


    else:

        # ----------------------------------------------------
        # FINAL STATE
        # ----------------------------------------------------

        system_state["state"] = (
            "COMPLETED"
        )

        system_state["progress"] = 100

        system_state["verification"] = (
            "PASSED"
        )

        system_state["encoder_pulses"] = 1200

        # IMPORTANT:
        # Stop the backend timer so the cycle
        # does not continue or restart.

        system_state["start_time"] = None


    # --------------------------------------------------------
    # RETURN STATUS
    # --------------------------------------------------------

    return jsonify({
        "system": system_state["system_id"],
        "state": system_state["state"],
        "progress": system_state["progress"],
        "controller": system_state["controller"],
        "cable_diameter_mm": system_state["cable_od_mm"],
        "specimen_length_mm": system_state["specimen_length_mm"],
        "test_method": system_state["test_method"],
        "cut_depth_mm": system_state["cut_depth_mm"],
        "encoder_pulses": system_state["encoder_pulses"],
        "verification": system_state["verification"],
        "cycle_id": system_state["cycle_id"]
    })


# ============================================================
# CONFIGURE API
# ============================================================

@app.route(
    "/api/configure",
    methods=["POST"]
)
def configure():

    data = request.get_json() or {}


    # --------------------------------------------------------
    # Controller
    # --------------------------------------------------------

    if data.get("controller") == "plc":
        system_state["controller"] = "PLC"
    else:
        system_state["controller"] = "ESP32"


    # --------------------------------------------------------
    # Cable diameter
    # --------------------------------------------------------

    try:

        diameter = float(
            data.get("diameter", 12)
        )

    except (
        TypeError,
        ValueError
    ):

        diameter = 12.0


    system_state["cable_od_mm"] = max(
        5.0,
        min(25.0, diameter)
    )


    # --------------------------------------------------------
    # Specimen length
    # --------------------------------------------------------

    try:

        length = float(
            data.get("length", 50)
        )

    except (
        TypeError,
        ValueError
    ):

        length = 50.0


    system_state["specimen_length_mm"] = max(
        20.0,
        min(300.0, length)
    )


    # --------------------------------------------------------
    # Test method
    # --------------------------------------------------------

    method = data.get(
        "test_method",
        "insulation"
    )


    if method not in METHODS:
        method = "insulation"


    system_state["test_method"] = method


    return jsonify({
        "status": "CONFIGURED",
        "controller": system_state["controller"],
        "test_method": system_state["test_method"]
    })


# ============================================================
# START PROCESS API
# ============================================================

@app.route(
    "/api/start",
    methods=["POST"]
)
def start_process():

    # --------------------------------------------------------
    # Cannot start while E-Stop is active.
    # --------------------------------------------------------

    if system_state["state"] == "EMERGENCY_STOP":

        return jsonify({
            "status": "ERROR",
            "message": "Clear E-Stop before starting"
        }), 400


    data = request.get_json() or {}


    # --------------------------------------------------------
    # Controller
    # --------------------------------------------------------

    if data.get("controller") == "plc":
        system_state["controller"] = "PLC"
    else:
        system_state["controller"] = "ESP32"


    # --------------------------------------------------------
    # Cable diameter
    # --------------------------------------------------------

    try:

        diameter = float(
            data.get(
                "diameter",
                system_state["cable_od_mm"]
            )
        )

    except (
        TypeError,
        ValueError
    ):

        diameter = 12.0


    system_state["cable_od_mm"] = max(
        5.0,
        min(25.0, diameter)
    )


    # --------------------------------------------------------
    # Specimen length
    # --------------------------------------------------------

    try:

        length = float(
            data.get(
                "length",
                system_state["specimen_length_mm"]
            )
        )

    except (
        TypeError,
        ValueError
    ):

        length = 50.0


    system_state["specimen_length_mm"] = max(
        20.0,
        min(300.0, length)
    )


    # --------------------------------------------------------
    # Test method
    # --------------------------------------------------------

    method = data.get(
        "test_method",
        system_state["test_method"]
    )


    if method not in METHODS:
        method = "insulation"


    system_state["test_method"] = method


    # --------------------------------------------------------
    # RESET CYCLE
    # --------------------------------------------------------

    system_state["state"] = (
        "DIAMETER DETECTION"
    )

    system_state["progress"] = 0

    system_state["encoder_pulses"] = 0

    system_state["cut_depth_mm"] = 0.0

    system_state["verification"] = (
        "WAITING"
    )

    system_state["start_time"] = (
        time.time()
    )

    system_state["cycle_id"] += 1


    return jsonify({
        "status": "STARTED",
        "cycle_id": system_state["cycle_id"],
        "method": METHODS[method]["name"]
    })


# ============================================================
# EMERGENCY STOP API
# ============================================================

@app.route(
    "/api/emergency_stop",
    methods=["POST"]
)
def emergency_stop():

    system_state["state"] = (
        "EMERGENCY_STOP"
    )

    system_state["progress"] = 0

    system_state["verification"] = (
        "HALTED"
    )

    system_state["encoder_pulses"] = 0

    system_state["start_time"] = None


    return jsonify({
        "status": "HALTED",
        "state": "EMERGENCY_STOP"
    })


# ============================================================
# RESET API
# ============================================================

@app.route(
    "/api/reset",
    methods=["POST"]
)
def reset():

    system_state["state"] = (
        "READY"
    )

    system_state["progress"] = 0

    system_state["encoder_pulses"] = 0

    system_state["cut_depth_mm"] = 0.0

    system_state["verification"] = (
        "WAITING"
    )

    system_state["start_time"] = None


    return jsonify({
        "status": "RESET",
        "state": "READY"
    })


# ============================================================
# RUN APPLICATION
# ============================================================

if __name__ == "__main__":

    app.run(
        debug=True,
        host="127.0.0.1",
        port=5001
    )