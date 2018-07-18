package com.faltro.houdoku.controller;

import com.faltro.houdoku.model.Config;
import com.faltro.houdoku.util.SceneManager;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.control.*;
import javafx.scene.effect.ColorAdjust;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;

import java.util.HashMap;

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
     * The width of the list of topics as a multiplier of the container width.
     */
    private static final double TOPIC_LIST_WIDTH = 0.25;
    /**
     * A mapping of topic names and the string to their matching icon file.
     */
    private static final HashMap<String, String> ICON_MAP = new HashMap<>();

    static {
        ICON_MAP.put("Night Mode", "/img/icon_night_mode.png");
        ICON_MAP.put("Reader", "/img/icon_reader.png");
    }

    @FXML
    private VBox container;
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
    @FXML
    private CheckBox restrictPreloadingCheck;
    @FXML
    private HBox preloadingAmountBox;
    @FXML
    private Spinner<Integer> preloadingAmountSpinner;
    @FXML
    private Button readerKeyPrevPage;
    @FXML
    private Button readerKeyNextPage;
    @FXML
    private Button readerKeyFirstPage;
    @FXML
    private Button readerKeyLastPage;
    @FXML
    private Button readerKeyToSeries;


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

        // set the width of the topic listView
        listView.prefWidthProperty().bind(
                container.widthProperty()
                        .multiply(TOPIC_LIST_WIDTH));

        // populate the listView with topics
        ObservableList<HBox> items = FXCollections.observableArrayList();
        for (Node node : configContentContainer.getChildren()) {
            String topic_name = node.getUserData().toString();
            HBox item_container = new HBox();
            item_container.getStyleClass().add("listItem");
            Text item_text = new Text(topic_name);
            Image item_image = new Image(ICON_MAP.get(topic_name));
            ImageView item_imageview = new ImageView(item_image);
            item_container.getChildren().add(item_imageview);
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

        // add bindings for miscellaneous properties
        nightModeReaderCheck.disableProperty().bind(nightModeCheck.selectedProperty().not());
        preloadingAmountBox.disableProperty().bind(
                restrictPreloadingCheck.selectedProperty().not());
    }

    /**
     * @see Controller#onMadeActive()
     */
    @Override
    public void onMadeActive() {
        listView.getSelectionModel().selectFirst();

        // update controls with current values
        Config config = sceneManager.getConfig();
        nightModeCheck.setSelected(
                (boolean) config.getValue(Config.Field.NIGHT_MODE_ENABLED));
        nightModeReaderCheck.setSelected(
                (boolean) config.getValue(Config.Field.NIGHT_MODE_READER_ONLY));
        effectColorRadio.setSelected("color".equals(
                config.getValue(Config.Field.PAGE_FILTER_TYPE)));
        effectBrightnessRadio.setSelected("brightness".equals(
                config.getValue(Config.Field.PAGE_FILTER_TYPE)));
        effectNoneRadio.setSelected("none".equals(
                config.getValue(Config.Field.PAGE_FILTER_TYPE)));
        filterHueSlider.setValue(
                (double) config.getValue(Config.Field.PAGE_FILTER_COLOR_HUE));
        filterSaturationSlider.setValue(
                (double) config.getValue(Config.Field.PAGE_FILTER_COLOR_SATURATION));
        filterBrightnessSlider.setValue(
                (double) config.getValue(Config.Field.PAGE_FILTER_BRIGHTNESS));
        restrictPreloadingCheck.setSelected(
                (boolean) config.getValue(Config.Field.RESTRICT_PRELOAD_PAGES));
        preloadingAmountSpinner.getValueFactory().setValue(
                (int) Math.round((double) config.getValue(Config.Field.PRELOAD_PAGES_AMOUNT)));
        readerKeyPrevPage.setText(
                (String) config.getValue(Config.Field.READER_KEY_PREV_PAGE));
        readerKeyNextPage.setText(
                (String) config.getValue(Config.Field.READER_KEY_NEXT_PAGE));
        readerKeyFirstPage.setText(
                (String) config.getValue(Config.Field.READER_KEY_FIRST_PAGE));
        readerKeyLastPage.setText(
                (String) config.getValue(Config.Field.READER_KEY_LAST_PAGE));
        readerKeyToSeries.setText(
                (String) config.getValue(Config.Field.READER_KEY_TO_SERIES));
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
        Text selected_text = (Text) selected_item.getChildren().get(1);
        for (Node node : configContentContainer.getChildren()) {
            boolean matches_clicked = node.getUserData().toString().equals(selected_text.getText());
            node.setVisible(matches_clicked);
            node.setManaged(matches_clicked);
        }
    }

    /**
     * Apply changes to the config using page controls, then close the window.
     */
    @FXML
    private void confirm() {
        Config config = sceneManager.getConfig();
        config.replaceValue(Config.Field.NIGHT_MODE_ENABLED,
                nightModeCheck.isSelected());
        config.replaceValue(Config.Field.NIGHT_MODE_READER_ONLY,
                nightModeReaderCheck.isSelected());
        config.replaceValue(Config.Field.PAGE_FILTER_TYPE,
                effectColorRadio.isSelected() ? "color" :
                        effectBrightnessRadio.isSelected() ? "brightness" : "none");
        config.replaceValue(Config.Field.PAGE_FILTER_COLOR_HUE,
                filterHueSlider.getValue());
        config.replaceValue(Config.Field.PAGE_FILTER_COLOR_SATURATION,
                filterSaturationSlider.getValue());
        config.replaceValue(Config.Field.PAGE_FILTER_BRIGHTNESS,
                filterBrightnessSlider.getValue());
        config.replaceValue(Config.Field.RESTRICT_PRELOAD_PAGES,
                restrictPreloadingCheck.isSelected());
        config.replaceValue(Config.Field.PRELOAD_PAGES_AMOUNT,
                preloadingAmountSpinner.getValue());
        config.replaceValue(Config.Field.READER_KEY_PREV_PAGE,
                readerKeyPrevPage.getText());
        config.replaceValue(Config.Field.READER_KEY_NEXT_PAGE,
                readerKeyNextPage.getText());
        config.replaceValue(Config.Field.READER_KEY_FIRST_PAGE,
                readerKeyFirstPage.getText());
        config.replaceValue(Config.Field.READER_KEY_LAST_PAGE,
                readerKeyLastPage.getText());
        config.replaceValue(Config.Field.READER_KEY_TO_SERIES,
                readerKeyToSeries.getText());

        sceneManager.saveConfig();

        // ensure that night_mode_reader_only is properly applied
        toggleNightMode();
        toggleNightMode();

        onMadeInactive();
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
            onMadeActive();
        }
    }

    @FXML
    private void promptKeyBinding(ActionEvent event) {
        Button caller_button = (Button) event.getSource();

        Alert alert = new Alert(Alert.AlertType.NONE,
                "Press the key to bind to this operation.", ButtonType.CANCEL);
        Button cancel_button = (Button) alert.getDialogPane().lookupButton(ButtonType.CANCEL);
        cancel_button.setOnKeyPressed(keyEvent -> {
            caller_button.setText(keyEvent.getCode().toString());
            alert.close();
        });

        alert.setTitle(stage.getTitle());
        alert.showAndWait();
    }

    /**
     * Reset the page effect sliders/radios to their initial values.
     */
    @FXML
    private void resetPageEffects() {
        Config config = sceneManager.getConfig();
        filterHueSlider.setValue(
                (double) config.getValue(Config.Field.PAGE_FILTER_COLOR_HUE));
        filterSaturationSlider.setValue(
                (double) config.getValue(Config.Field.PAGE_FILTER_COLOR_SATURATION));
        filterBrightnessSlider.setValue(
                (double) config.getValue(Config.Field.PAGE_FILTER_BRIGHTNESS));

        effectColorRadio.setSelected("color".equals(
                config.getValue(Config.Field.PAGE_FILTER_TYPE)));
        effectBrightnessRadio.setSelected("brightness".equals(
                config.getValue(Config.Field.PAGE_FILTER_TYPE)));
        effectNoneRadio.setSelected("none".equals(
                config.getValue(Config.Field.PAGE_FILTER_TYPE)));
    }
}