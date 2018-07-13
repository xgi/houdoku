package com.faltro.houdoku.controller;

import com.faltro.houdoku.model.Config;
import com.faltro.houdoku.util.SceneManager;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.control.*;
import javafx.scene.effect.ColorAdjust;
import javafx.scene.image.ImageView;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;

/**
 * The controller for the config page.
 * <p>
 * The FXML file for this view is at resources/fxml/config.fxml
 *
 * @see Controller
 */
public class ConfigController extends Controller {
    public static final int ID = 4;
    /**
     * The fixed position of the divider between the topics list and content.
     */
    private static final float FIXED_CONTENT_DIVIDER_POS = 0.3f;
    /**
     * The width of the content container as a multiplier of the root width.
     */
    private static final double CONTENT_WIDTH = 0.7;

    @FXML
    private VBox container;
    @FXML
    private SplitPane configSplitPane;
    @FXML
    private ListView<HBox> listView;
    @FXML
    private VBox configContentContainer;
    @FXML
    private CheckBox nightModeCheck;
    @FXML
    private CheckBox nightModeReaderCheck;
    @FXML
    private RadioButton effectColorRadio;
    @FXML
    private VBox effectColorBox;
    @FXML
    private RadioButton effectBrightnessRadio;
    @FXML
    private VBox effectBrightnessBox;
    @FXML
    private RadioButton effectNoneRadio;
    @FXML
    private Slider filterHueSlider;
    @FXML
    private Label filterHueSliderLabel;
    @FXML
    private Slider filterSaturationSlider;
    @FXML
    private Label filterSaturationSliderLabel;
    @FXML
    private Slider filterBrightnessSlider;
    @FXML
    private Label filterBrightnessSliderLabel;
    @FXML
    private ImageView effectColorPreview;
    @FXML
    private ImageView effectBrightnessPreview;

    public ConfigController(SceneManager sceneManager) {
        super(sceneManager);
    }

    /**
     * Initialize the components of the controller's view.
     *
     * @see Controller#initialize()
     */
    @Override
    @FXML
    public void initialize() {
        super.initialize();

        // set the position of the divider
        configSplitPane.setDividerPosition(0, FIXED_CONTENT_DIVIDER_POS);

        // populate the listView with topics
        ObservableList<HBox> items = FXCollections.observableArrayList();
        for (Node node : configContentContainer.getChildren()) {
            HBox item_container = new HBox();
            item_container.getStyleClass().add("listItem");
            Text item_text = new Text(node.getUserData().toString());
            item_container.getChildren().add(item_text);
            items.add(item_container);
        }
        listView.setItems(items);

        // add listener to update the content panel when items are selected
        listView.getSelectionModel().selectedItemProperty().addListener(
                (observableValue, hBox, t1) -> updateContent()
        );

        // Bind the disable property of radio buttons with sub-boxes with the
        // matching sub-box. We would have liked to do this in the FXML file,
        // but there appears to be no way to bind with the inverse of a property
        // in FXML.
        effectColorBox.disableProperty().bind(effectColorRadio.selectedProperty().not());
        effectBrightnessBox.disableProperty().bind(effectBrightnessRadio.selectedProperty().not());

        // add bindings for page color/brightness filter previews
        filterHueSlider.valueProperty().addListener(
                (observableValue, oldValue, newValue) -> {
                    filterHueSliderLabel.setText(String.format("%.2f", newValue.doubleValue()));
                    ColorAdjust color_adjust = new ColorAdjust();
                    color_adjust.setHue(newValue.doubleValue());
                    color_adjust.setSaturation(filterSaturationSlider.getValue());
                    effectColorPreview.setEffect(color_adjust);
                }
        );
        filterSaturationSlider.valueProperty().addListener(
                (observableValue, oldValue, newValue) -> {
                    filterSaturationSliderLabel.setText(
                            String.format("%.2f", newValue.doubleValue()));
                    ColorAdjust color_adjust = new ColorAdjust();
                    color_adjust.setSaturation(newValue.doubleValue());
                    color_adjust.setHue(filterHueSlider.getValue());
                    effectColorPreview.setEffect(color_adjust);
                }
        );
        filterBrightnessSlider.valueProperty().addListener(
                (observableValue, oldValue, newValue) -> {
                    filterBrightnessSliderLabel.setText(
                            String.format("%.2f", newValue.doubleValue()));
                    ColorAdjust color_adjust = new ColorAdjust();
                    color_adjust.setBrightness(newValue.doubleValue());
                    effectBrightnessPreview.setEffect(color_adjust);
                }
        );
    }

    /**
     * @see Controller#onMadeActive()
     */
    @Override
    public void onMadeActive() {
        listView.getSelectionModel().selectFirst();

        // update controls with current values
        Config config = sceneManager.getConfig();
        nightModeCheck.setSelected((boolean) config.getField("night_mode_enabled"));
        effectColorRadio.setSelected("color".equals(config.getField("page_filter_type")));
        effectBrightnessRadio.setSelected("brightness".equals(config.getField("page_filter_type")));
        effectNoneRadio.setSelected("none".equals(config.getField("page_filter_type")));
        filterHueSlider.setValue((double) config.getField("page_filter_color_hue"));
        filterSaturationSlider.setValue((double) config.getField("page_filter_color_saturation"));
        filterBrightnessSlider.setValue((double) config.getField("page_filter_brightness"));
    }

    /**
     * @see Controller#onMadeInactive() ()
     */
    @Override
    public void onMadeInactive() {
        stage.hide();

        // reload the active page
        Parent root = sceneManager.getStage().getScene().getRoot();
        sceneManager.getController(root).reload();
    }

    /**
     * Update the content pane using the selected item in the list.
     */
    private void updateContent() {
        HBox selected_item = listView.getSelectionModel().getSelectedItem();
        Text selected_text = (Text) selected_item.getChildren().get(0);
        for (Node node : configContentContainer.getChildren()) {
            boolean matches_clicked = node.getUserData().toString().equals(selected_text.getText());
            node.setVisible(matches_clicked);
            node.setManaged(matches_clicked);
        }
    }

    /**
     * Cancel making changes to the config (without saving anything).
     */
    @FXML
    private void cancel() {
        onMadeInactive();
    }

    /**
     * Prompt the user to restore the default config.
     */
    @FXML
    private void promptRestoreDefaults() {
        Alert alert = new Alert(Alert.AlertType.WARNING, "", ButtonType.YES,
                ButtonType.CANCEL);

        Label label = new Label("Are you sure you want to restore the default " +
                "configuration?\nThis will erase your current settings.");
        label.setWrapText(true);

        VBox alert_container = new VBox();
        alert_container.getChildren().add(label);

        alert.getDialogPane().setContent(alert_container);
        alert.setTitle(stage.getTitle());
        alert.showAndWait();

        if (alert.getResult() == ButtonType.YES) {
            sceneManager.getConfig().restoreDefaults();
        }
    }
}